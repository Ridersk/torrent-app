import {DeviceEventEmitter} from "react-native";
import {RealmDatabase} from "../database/realm";
import {DownloadObject} from "../database/realm/objects/download";
import TorrentModule, {TorrentModuleInterface} from "../modules/TorrentModule";

export class DownloadManager {
  private downloadDb: RealmDatabase;
  private torrentService: TorrentModuleInterface;

  constructor() {
    this.downloadDb = new RealmDatabase(DownloadObject);
    this.torrentService = TorrentModule;
    this.addTorrentListeners();
  }

  public getDownloadsListener(callback: (data: any) => void) {
    this.downloadDb.addListener((data: any) => {
      callback(data);
    });
  }

  public async add(magnetLink: string) {
    const download = await this.downloadDb.create({
      name: "Searching...",
      source: magnetLink,
      status: "DOWNLOADING",
      progress: 0,
    });
    console.log("Starting Torrent...");
    this.torrentService.add(download._id, magnetLink);
    return download;
  }

  public async pause(downloadId: string) {
    try {
      await this.torrentService.pause(downloadId);
    } catch (error) {
      console.error(error);
    }
    this.downloadDb.update(downloadId, {status: "PAUSED"});
  }

  public async resume(downloadId: string) {
    try {
      await this.torrentService.resume(downloadId);
    } catch (error) {
      console.error(error);
      const download = await this.downloadDb.get(downloadId);

      if (!download) {
        console.error("Download not found");
        return;
      }

      const magnetLink = download.source;
      this.torrentService.add(downloadId, magnetLink);
    }
    this.downloadDb.update(downloadId, {status: "DOWNLOADING"});
  }

  public async restart(downloadId: string) {
    const download = await this.downloadDb.get(downloadId);

    if (!download) {
      console.error("Download not found");
      return;
    }

    const magnetLink = download.source;
    console.log("Starting Torrent...");
    this.torrentService.add(downloadId, magnetLink);
    this.downloadDb.update(downloadId, {status: "DOWNLOADING"});
  }

  public async pauseUnfinishedDownloads() {
    const downloads = await this.downloadDb.getAllByFilters({
      status: "DOWNLOADING",
    });
    console.log("Pausing Torrent downloads...");
    console.log(`UNFINISHED_DOWNLOADS: ${downloads.length}`, downloads);
    for (const download of downloads) {
      this.pause(download._id);
    }
  }

  private addTorrentListeners() {
    DeviceEventEmitter.addListener("TORRENT_INFO", data => {
      console.log("Torrent info: ", data);
      this.addTorrentInfo(data.downloadId, data);
    });
    DeviceEventEmitter.addListener("ADD_TORRENT", data =>
      console.log("Add torrent: ", data),
    );
    DeviceEventEmitter.addListener("PIECE_FINISHED", data => {
      // console.log("Progress: ", data);
      this.updateDownloadProgress(data.downloadId, data.progress);
    });
    DeviceEventEmitter.addListener("TORRENT_FINISHED", data => {
      console.log("Torrent finished: ", data);
      this.finishDownload(data.downloadId);
    });
    DeviceEventEmitter.addListener("METADATA_RECEIVED", data =>
      console.log("Metadata: ", data),
    );
    DeviceEventEmitter.addListener("DHT_ERROR", data =>
      console.error("DHT Error: ", data),
    );
    DeviceEventEmitter.addListener("ERROR", data =>
      console.error("Error: ", data),
    );
  }

  private addTorrentInfo(downloadId: string, info: any) {
    this.downloadDb.update(downloadId, {
      name: info.name,
      location: info.folderLocation,
    });
  }

  private updateDownloadProgress(downloadId: string, progress: number) {
    this.downloadDb.update(downloadId, {progress});
  }

  private finishDownload(downloadId: string) {
    this.downloadDb.update(downloadId, {progress: 100, status: "COMPLETED"});
  }
}
