package com.tstreaming.torrent;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.frostwire.jlibtorrent.AlertListener;
import com.frostwire.jlibtorrent.SessionManager;
import com.frostwire.jlibtorrent.SessionParams;
import com.frostwire.jlibtorrent.SettingsPack;
import com.frostwire.jlibtorrent.TorrentInfo;
import com.frostwire.jlibtorrent.alerts.AddTorrentAlert;
import com.frostwire.jlibtorrent.alerts.Alert;
import com.frostwire.jlibtorrent.alerts.AlertType;
import com.frostwire.jlibtorrent.alerts.PieceFinishedAlert;
import com.frostwire.jlibtorrent.alerts.TorrentErrorAlert;
import com.frostwire.jlibtorrent.alerts.TorrentFinishedAlert;
import com.frostwire.jlibtorrent.swig.settings_pack;

import android.content.Context;
import android.util.Log;

import java.io.File;
import java.io.IOException;
import java.io.InvalidObjectException;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;


public class NativeTorrentModule extends ReactContextBaseJavaModule {

    private final Context context;
    private final Map<String, SessionManager> downloadsInProcessing;

    private static final String TAG = NativeTorrentModule.class.getSimpleName();

    public NativeTorrentModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
        this.downloadsInProcessing = new HashMap<>();
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void download(String downloadId, String magnetLink) {
        new Thread(() -> downloadProcess(downloadId, magnetLink)).start();
    }

    @ReactMethod
    public void pause(String downloadId, Promise promise) {
        SessionManager sessionManager = this.downloadsInProcessing.get(downloadId);

        if (sessionManager == null) {
            String errorMsg = "Session Manager doesn't exists for download id " + downloadId;
            log(errorMsg);
            promise.reject("DOWNLOAD_PROCESS_NOT_FOUND", errorMsg);
            return;
        }

        sessionManager.pause();
        promise.resolve(null);
    }

    @ReactMethod
    public void resume(String downloadId, Promise promise) {
        SessionManager sessionManager = this.downloadsInProcessing.get(downloadId);

        if (sessionManager == null) {
            String errorMsg = "Session Manager doesn't exists for download id " + downloadId;
            log(errorMsg);
            promise.reject("DOWNLOAD_PROCESS_NOT_FOUND", errorMsg);
            return;
        }

        sessionManager.resume();
        promise.resolve(null);
    }

    private void downloadProcess(String downloadId, String magnetLink) {
        File rootFolderLocation = this.context.getExternalFilesDir(null);
        SessionManager sessionManager = new SessionManager();

        try {
            log("Magnet link to process: " + magnetLink);
            startSession(sessionManager);
            TorrentInfo torrentInfo = getInfoFromMagnet(sessionManager, magnetLink);
            File folderLocation = makeDownloadFolder(rootFolderLocation, downloadId);

            WritableMap infoData = Arguments.createMap();
            infoData.putString("name", torrentInfo.name());
            infoData.putString("folderLocation", folderLocation.getAbsolutePath());
            emitDataToApp("TORRENT_INFO", downloadId, infoData);

            startDownload(sessionManager, folderLocation, torrentInfo, downloadId);
        } catch (Exception e) {
            log(e.getMessage(), "e");
            WritableMap errorData = Arguments.createMap();
            errorData.putString("error", e.getMessage());
            emitDataToApp("ERROR", downloadId, errorData);
        } finally {
            sessionManager.stop();
        }
    }

    private void startDownload(
            SessionManager sessionManager,
            File folderLocation,
            TorrentInfo torrentInfo,
            String downloadId
    ) throws InterruptedException {
        final CountDownLatch signal = new CountDownLatch(1);

        addListener(sessionManager, downloadId, signal);
        log("Storage location: " + folderLocation.getAbsolutePath());
        log("Starting download");
        sessionManager.download(torrentInfo, folderLocation);
        this.downloadsInProcessing.put(downloadId, sessionManager);

        signal.await();

    }

    private File makeDownloadFolder(File rootFolder, String downloadId) throws IOException {
        File folder = new File(rootFolder.getAbsolutePath(), downloadId);

        if (!folder.exists()) {
            if (!folder.mkdirs()) {
                throw new IOException("Error on try creating folder");
            }
            log("Folder created");
        }

        return folder;
    }

    private void addListener(SessionManager session, String downloadId, CountDownLatch signal) {
        AlertListener listener = new AlertListener() {
            int progress = 0;

            @Override
            public int[] types() {
                return null;
            }

            @Override
            public void alert(Alert<?> alert) {
                AlertType type = alert.type();
                int index;
                WritableMap alertData = Arguments.createMap();

                switch (type) {
                    case ADD_TORRENT:
                        ((AddTorrentAlert) alert).handle().resume();
                        log("ADD_TORRENT: " + alert.message());
                        emitDataToApp("ADD_TORRENT", downloadId, alertData);
                        break;
                    case METADATA_RECEIVED:
                        log("METADATA_RECEIVED: " + alert.message());
                        emitDataToApp("METADATA_RECEIVED", downloadId, alertData);
                        break;
                    case PIECE_FINISHED:
                        int newProgress = (int) (
                                ((PieceFinishedAlert) alert).handle().status().progress() * 100
                        );
                        if (progress != newProgress) {
                            progress = newProgress;
                            index = ((PieceFinishedAlert) alert).pieceIndex();
                            log("Progress: " + progress + "%, "
                                    + "Rate: " + session.downloadRate() + ", "
                                    + "Piece: " + index
                            );
                            alertData.putInt("progress", progress);
                            emitDataToApp("PIECE_FINISHED", downloadId, alertData);
                        }
                        break;
                    case TORRENT_FINISHED:
                        ((TorrentFinishedAlert) alert).handle().pause();
                        log("TORRENT_FINISHED: " + alert.message());
                        emitDataToApp("TORRENT_FINISHED", downloadId, alertData);
                        signal.countDown();
                        break;
                    case STATE_UPDATE:
                        log("STATE_UPDATE: " + alert.message());
                        emitDataToApp("STATE_UPDATE", downloadId, alertData);
                        break;
                    case TORRENT_ERROR:
                        log("TORRENT_ERROR: " + alert.what());
                        log("Is paused = " + ((TorrentErrorAlert) alert).handle().status());
                        emitDataToApp("TORRENT_ERROR", downloadId, alertData);
                        signal.countDown();
                        break;
                    case DHT_ERROR:
                        log("DHT_ERROR: " + alert.message(), "e");
                        log(alert.message());
                        emitDataToApp("DHT_ERROR", downloadId, alertData);
                        signal.countDown();
                        break;
                    default:
                        break;
                }
            }
        };

        session.addListener(listener);
    }

    private void startSession(final SessionManager session) {
        SettingsPack settingsPack = new SettingsPack();
        SessionParams params = new SessionParams(settingsPack);

        settingsPack.setString(
                settings_pack.string_types.dht_bootstrap_nodes.swigValue(),
                "router.silotis.us:6881"
        );
        settingsPack.setString(
                settings_pack.string_types.dht_bootstrap_nodes.swigValue(),
                "router.bittorrent.com:6881"
        );
        settingsPack.setString(
                settings_pack.string_types.dht_bootstrap_nodes.swigValue(),
                "dht.transmissionbt.com:6881"
        );

        if (!session.isRunning())
            session.start(params);
    }

    private TorrentInfo getInfoFromMagnet(final SessionManager session, String magnetLink)
            throws InterruptedException, TimeoutException, InvalidObjectException {
        if (!magnetLink.startsWith("magnet:?")) {
            throw new TimeoutException("Magnet link is invalid");
        }

        waitForNodesInDHT(session);

        byte[] data = session.fetchMagnet(magnetLink, 30);
        TorrentInfo torrentInfo = TorrentInfo.bdecode(data);

        log("Torrent name: " + torrentInfo.name());

        boolean torrentIsValid = torrentInfo.isValid();
        if (!torrentIsValid) {
            throw new InvalidObjectException("Torrent info is invalid");
        }

        return torrentInfo;
    }

    private void waitForNodesInDHT(final SessionManager session)
            throws InterruptedException, TimeoutException {
        final CountDownLatch signal = new CountDownLatch(1);

        final Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                long nodes = session.stats().dhtNodes();
                if (nodes >= 5) {
                    log("DHT contains " + nodes + " nodes");
                    signal.countDown();
                    timer.cancel();
                }
            }
        }, 0, 100);

        log("Waiting for nodes in DHT (10 seconds)...");
        boolean r = signal.await(10, TimeUnit.SECONDS);
        if (!r) {
            throw new TimeoutException("DHT bootstrap timeout");
        }
    }

    private void emitDataToApp(String eventType, String downloadId, WritableMap data) {
        data.putString("downloadId", downloadId);
        this.getReactApplicationContext().getJSModule(
                DeviceEventManagerModule.RCTDeviceEventEmitter.class
        ).emit(eventType, data);
    }

    private void log(String message) {
        log(message, "i");
    }

    private void log(String message, String level) {
        switch (level) {
            case "d":
                Log.d(TAG, message);
                break;
            case "i":
                Log.i(TAG, message);
                break;
            case "e":
                Log.e(TAG, message);
                break;
        }
    }
}
