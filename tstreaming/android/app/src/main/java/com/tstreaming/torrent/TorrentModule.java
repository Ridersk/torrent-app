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
import com.frostwire.jlibtorrent.Sha1Hash;
import com.frostwire.jlibtorrent.TorrentHandle;
import com.frostwire.jlibtorrent.TorrentInfo;
import com.frostwire.jlibtorrent.TorrentStatus;
import com.frostwire.jlibtorrent.alerts.AddTorrentAlert;
import com.frostwire.jlibtorrent.alerts.Alert;
import com.frostwire.jlibtorrent.alerts.AlertType;
import com.frostwire.jlibtorrent.alerts.MetadataReceivedAlert;
import com.frostwire.jlibtorrent.alerts.PieceFinishedAlert;
import com.frostwire.jlibtorrent.alerts.TorrentAlert;
import com.frostwire.jlibtorrent.alerts.TorrentErrorAlert;
import com.frostwire.jlibtorrent.alerts.TorrentFinishedAlert;
import com.frostwire.jlibtorrent.swig.settings_pack;

import android.content.Context;
import android.util.Log;

import java.io.File;
import java.io.IOException;
import java.nio.Buffer;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;


public class TorrentModule extends ReactContextBaseJavaModule {

    private final Context context;
    private final Map<String, SessionManager> sessionManagers;
    private final Map<String, Sha1Hash> downloadsInProgress;

    private static final String TAG = TorrentModule.class.getSimpleName();

    public TorrentModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
        this.sessionManagers = new HashMap<>();
        this.downloadsInProgress = new HashMap<>();
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void add(String downloadId, String magnetLink) {
        log("Action: ADD download " + downloadId);
        new Thread(() -> addDownload(downloadId, magnetLink)).start();
    }

    @ReactMethod
    public void pause(String downloadId, Promise promise) {
        log("Action: PAUSE download " + downloadId);
        SessionManager sessionManager = this.sessionManagers.get(downloadId);

        if (sessionManager == null) {
            String errorMsg = "Session Manager doesn't exists for download id " + downloadId;
            log(errorMsg, "e");
            promise.reject("DOWNLOAD_PROCESS_NOT_FOUND", errorMsg);
            return;
        }

        sessionManager.pause();
        promise.resolve(null);
    }

    @ReactMethod
    public void resume(String downloadId, Promise promise) {
        log("Action: RESUME download " + downloadId);
        SessionManager sessionManager = this.sessionManagers.get(downloadId);

        if (sessionManager == null) {
            String errorMsg = "Session Manager doesn't exists for download id " + downloadId;
            log(errorMsg, "e");
            promise.reject("DOWNLOAD_PROCESS_NOT_FOUND", errorMsg);
            return;
        }

        sessionManager.resume();
        promise.resolve(null);
    }

    @ReactMethod
    public void remove(String downloadId, Promise promise) {
        SessionManager sessionManager = this.sessionManagers.get(downloadId);
        Sha1Hash downloadHash = this.downloadsInProgress.get(downloadId);

        if (sessionManager != null && downloadHash != null) {
            TorrentHandle torrentHandle = sessionManager.find(downloadHash);
            if (torrentHandle != null) {
                sessionManager.remove(torrentHandle);
                this.sessionManagers.remove(downloadId);
                this.downloadsInProgress.remove(downloadId);
            }
        }

        boolean folderRemoved = this.removeDownloadFolder(downloadId);
        if (folderRemoved) {
            promise.resolve(null);
        } else {
            promise.reject("REMOVE_EXCEPTION", "Folder has not been deleted");
        }
    }

    private void addDownload(String downloadId, String magnetLink) {
        SessionManager sessionManager = new SessionManager();

        try {
            File folderLocation = makeDownloadFolder(downloadId);

            log("Magnet link to process: " + magnetLink);
            startSession(sessionManager);
            startDownload(sessionManager, folderLocation, magnetLink, downloadId);
        } catch (Exception e) {
            log(e.getMessage(), "e");
            WritableMap errorData = Arguments.createMap();
            errorData.putString("error", e.getMessage());
            emitDataToApp("ADD_ERROR", downloadId, errorData);
        } finally {
            log("Closing sessionManager to downloadId: " + downloadId);
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
        this.sessionManagers.put(downloadId, sessionManager);

        signal.await();
    }

    private File makeDownloadFolder(String downloadId) throws IOException {
        File downloadFolder = getDownloadFolder(downloadId);

        log("Folder to download: " + downloadFolder.getAbsolutePath());
        if (!downloadFolder.exists()) {
            if (!downloadFolder.mkdirs()) {
                throw new IOException("Error on try creating folder");
            }
            log("Folder created");
        }

        return downloadFolder;
    }

    private boolean removeDownloadFolder(String downloadId) {
        File downloadFolder = getDownloadFolder(downloadId);

        log("Folder to remove: " + downloadFolder.getAbsolutePath());
        if (!downloadFolder.exists()) {
            return true;
        }

        return deleteFolderRecursively(downloadFolder);
    }

    public static boolean deleteFolderRecursively(File folder) {
        if (folder.isDirectory()) {
            File[] files = folder.listFiles();
            if (files != null) {
                for (File file : files) {
                    deleteFolderRecursively(file);
                }
            }
        }
        return folder.delete();
    }

    private File getDownloadFolder(String downloadId) {
        File rootFolder = this.context.getExternalFilesDir(null);
        return new File(rootFolder.getAbsolutePath(), downloadId);
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
                TorrentHandle torrentHandle = ((TorrentAlert<?>) alert).handle();

                switch (type) {
                    case ADD_TORRENT:
                        log("ADD_TORRENT: " + alert.message() + " Hash: " + torrentHandle.infoHash());
                        torrentHandle.resume();
                        emitDataToApp("ADD_TORRENT", downloadId, alertData);
                        break;
                    case METADATA_RECEIVED:
                        TorrentInfo torrentInfo = torrentHandle.torrentFile();
                        String folderLocation = ((MetadataReceivedAlert) alert).handle().savePath();
                        log("METADATA_RECEIVED: " + torrentInfo.name() +
                                " Hash: " + torrentInfo.infoHash() +
                                " Folder: " + folderLocation);
                        downloadsInProgress.put(downloadId, torrentInfo.infoHash());
                        alertData.putString("name", torrentInfo.name());
                        alertData.putString("folderLocation", folderLocation);
                        alertData.putInt("totalSize", (int) torrentInfo.totalSize());
                        emitDataToApp("TORRENT_INFO", downloadId, alertData);
                        break;
                    case PIECE_FINISHED:
                        torrentInfo = torrentHandle.torrentFile();
                        TorrentStatus status = torrentHandle.status();
                        int newProgress = (int) (status.progress() * 100);
                        int downloadedSize = (int) (torrentInfo.totalSize() * status.progress());
                        long currentProgressEventTime = System.currentTimeMillis();
                        int downloadRate = (int) session.downloadRate();

                        if (progress != newProgress &&
                                currentProgressEventTime - lastProgressEventTime > 500) {
                            progress = newProgress;
                            lastProgressEventTime = currentProgressEventTime;
                            index = ((PieceFinishedAlert) alert).pieceIndex();
                            log("Progress: " + progress + "%, "
                                    + "Rate: " + downloadRate + ", "
                                    + "Piece: " + index
                            );
                            alertData.putInt("downloadedSize", downloadedSize);
                            alertData.putInt("downloadRate", downloadRate);
                            alertData.putInt("peers", status.numPeers());
                            alertData.putInt("progress", progress);
                            alertData.putInt("seeders", status.numSeeds());
                            emitDataToApp("PIECE_FINISHED", downloadId, alertData);
                        }
                        break;
                    case TORRENT_FINISHED:
                        ((TorrentFinishedAlert) alert).handle().pause();
                        log("TORRENT_FINISHED: " + alert.message());
                        emitDataToApp("TORRENT_FINISHED", downloadId, alertData);
                        sessionManagers.remove(downloadId);
                        downloadsInProgress.remove(downloadId);
                        signal.countDown();
                        break;
                    case TORRENT_ERROR:
                    case DHT_ERROR:
                    case FILE_ERROR:
                    case LSD_ERROR:
                    case PEER_ERROR:
                    case PORTMAP_ERROR:
                    case SESSION_ERROR:
//                    case TRACKER_ERROR:
                    case UDP_ERROR:
                    case METADATA_FAILED:
                    case FILE_RENAME_FAILED:
                    case TORRENT_DELETE_FAILED:
                    case SAVE_RESUME_DATA_FAILED:
                    case HASH_FAILED:
                    case LISTEN_FAILED:
                    case SCRAPE_FAILED:
                    case STORAGE_MOVED_FAILED:
                        log("TORRENT_ERROR: " + alert.what());
                        alertData.putString("error", alert.message());
                        emitDataToApp("TORRENT_ERROR", downloadId, alertData);
                        sessionManagers.remove(downloadId);
                        downloadsInProgress.remove(downloadId);
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
