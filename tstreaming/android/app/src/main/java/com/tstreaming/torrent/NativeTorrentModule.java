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
import com.frostwire.jlibtorrent.alerts.MetadataReceivedAlert;
import com.frostwire.jlibtorrent.alerts.PieceFinishedAlert;
import com.frostwire.jlibtorrent.alerts.TorrentErrorAlert;
import com.frostwire.jlibtorrent.alerts.TorrentFinishedAlert;
import com.frostwire.jlibtorrent.swig.settings_pack;

import android.content.Context;
import android.util.Log;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;


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
            File folderLocation = makeDownloadFolder(rootFolderLocation, downloadId);

            log("Magnet link to process: " + magnetLink);
            startSession(sessionManager);
            startDownload(sessionManager, folderLocation, magnetLink, downloadId);
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
            String magnetLink,
            String downloadId
    ) throws InterruptedException {
        final CountDownLatch signal = new CountDownLatch(1);

        addListener(sessionManager, downloadId, signal);
        log("Storage location: " + folderLocation.getAbsolutePath());
        log("Starting download");
        sessionManager.download(magnetLink, folderLocation);
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
            long lastProgressEventTime = System.currentTimeMillis();

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
                        TorrentInfo torrentInfo = ((MetadataReceivedAlert) alert)
                                .handle()
                                .torrentFile();
                        String folderLocation = ((MetadataReceivedAlert) alert).handle().savePath();


                        ((MetadataReceivedAlert) alert).handle().torrentFile();

                        log("METADATA_RECEIVED: " + torrentInfo.name() + " - " + folderLocation);

                        alertData.putString("name", torrentInfo.name());
                        alertData.putString("folderLocation", folderLocation);
                        emitDataToApp("TORRENT_INFO", downloadId, alertData);
                        break;
                    case PIECE_FINISHED:
                        int newProgress = (int) (
                                ((PieceFinishedAlert) alert).handle().status().progress() * 100
                        );
                        long currentProgressEventTime = System.currentTimeMillis();

                        if (progress != newProgress &&
                                currentProgressEventTime - lastProgressEventTime > 500) {
                            progress = newProgress;
                            lastProgressEventTime = currentProgressEventTime;
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
                    case DHT_ERROR:
                    case FILE_ERROR:
                    case LSD_ERROR:
                    case PEER_ERROR:
                    case PORTMAP_ERROR:
                    case SESSION_ERROR:
                    case TRACKER_ERROR:
                    case UDP_ERROR:
                        log("TORRENT_ERROR: " + alert.what());
                        log("Is paused = " + ((TorrentErrorAlert) alert).handle().status());
                        alertData.putString("error", alert.message());
                        emitDataToApp("TORRENT_ERROR", downloadId, alertData);
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
