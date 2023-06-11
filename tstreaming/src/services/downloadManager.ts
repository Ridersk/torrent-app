import {DeviceEventEmitter} from "react-native";
import {RealmDatabase} from "../database/realm";
import {DownloadObject} from "../database/realm/objects/download";
import NativeTorrentModule, {
  NativeTorrentModuleInterface,
} from "../modules/NativeTorrentModule";

export class DownloadManager {
  private downloadDb: RealmDatabase;
  private torrentService: NativeTorrentModuleInterface;

  constructor() {
    this.downloadDb = new RealmDatabase(DownloadObject);
    this.torrentService = NativeTorrentModule;
    this.addNativeTorrentListeners();
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
    this.processTorrentDownload(download._id, magnetLink);
    return download;
  }

  public async pause(downloadId: string) {
    try {
      await this.torrentService.pause(downloadId);
      this.downloadDb.update(downloadId, {status: "PAUSED"});
    } catch (error) {
      console.error(error);
    }
  }

  public async resume(downloadId: string) {
    try {
      await this.torrentService.resume(downloadId);
      this.downloadDb.update(downloadId, {status: "DOWNLOADING"});
    } catch (error) {
      console.error(error);
    }
  }

  public async restart(downloadId: string) {
    // await this.torrentService.restart(downloadId);
    // this.downloadDb.update(downloadId, {status: "DOWNLOADING"});
  }

  private processTorrentDownload(downloadId: string, magnetLink: string) {
    console.log("Starting Torrent...");
    this.torrentService.download(downloadId, magnetLink);
  }

  private addNativeTorrentListeners() {
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
