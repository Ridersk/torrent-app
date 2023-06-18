import {DeviceEventEmitter} from "react-native";
import {RealmDatabase} from "../database/realm";
import {DownloadObject} from "../database/realm/objects/download";
import TorrentModule, {TorrentModuleInterface} from "../modules/TorrentModule";
import {DownloadModel} from "../models/download";

export default class DownloadManager {
  private static instance: DownloadManager;

  private downloadDb: RealmDatabase;
  private torrentService: TorrentModuleInterface;

  private constructor() {
    this.downloadDb = new RealmDatabase(DownloadObject);
    this.torrentService = TorrentModule;
  }

  public static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
      DownloadManager.instance.addTorrentListeners();
    }
    return DownloadManager.instance;
  }

  public getDownloadsListener(callback: (data: any) => void) {
    this.downloadDb.addObjectsListener((data: any) => {
      callback(data);
    });
  }

  public getDownloadListener(
    downloadId: string,
    callback: (data: DownloadModel) => void,
  ) {
    this.downloadDb.addObjectListener(downloadId, (data: any) => {
      callback(DownloadModel.from(data));
    });
  }

  public async add(magnetLink: string) {
    const download = await this.downloadDb.create({
      downloadedSize: 0,
      downloadRate: 0,
      name: "Searching...",
      peers: 0,
      progress: 0,
      seeders: 0,
      source: magnetLink,
      status: "DOWNLOADING",
      totalSize: 0,
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
    await this.downloadDb.update(downloadId, {status: "PAUSED"});
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
    await this.downloadDb.update(downloadId, {status: "DOWNLOADING"});
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
    await this.downloadDb.update(downloadId, {status: "DOWNLOADING"});
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

  public async remove(downloadId: string) {
    try {
      const download = await this.downloadDb.get(downloadId);

      if (!download) {
        console.error("Download not found");
        return;
      }

      if (!download.location) {
        console.error("Download location not found");
        return;
      }

      await this.torrentService.remove(downloadId, download.location);
      this.downloadDb.delete(downloadId);
    } catch (error) {
      console.error(error);
    }
  }

  public addTorrentListeners() {
    DeviceEventEmitter.addListener("ADD_TORRENT", data =>
      console.log("Add torrent: ", data),
    );
    DeviceEventEmitter.addListener("TORRENT_INFO", data => {
      console.log("Torrent info: ", data);
      this.addTorrentInfo(data.downloadId, data);
    });
    DeviceEventEmitter.addListener("PIECE_FINISHED", data => {
      this.updateDownload(data.downloadId, data);
    });
    DeviceEventEmitter.addListener("TORRENT_FINISHED", data => {
      console.log("Torrent finished: ", data);
      this.finishDownload(data.downloadId);
    });
    DeviceEventEmitter.addListener("TORRENT_ERROR", data => {
      console.error("Torrent Error: ", data);
      this.updateDownloadToError(data.downloadId);
    });
    DeviceEventEmitter.addListener("ADD_ERROR", data => {
      console.error("Add Error: ", data);
      this.updateDownloadToError(data.downloadId);
    });
  }

  private async addTorrentInfo(downloadId: string, info: any) {
    await this.downloadDb.update(downloadId, {
      name: info.name,
      location: info.folderLocation,
      totalSize: info.totalSize,
    });
  }

  private async updateDownload(downloadId: string, data: any) {
    await this.downloadDb.update(downloadId, {
      downloadedSize: data.downloadedSize,
      downloadRate: data.downloadRate,
      peers: data.peers,
      progress: data.progress,
      seeders: data.seeders,
    });
  }

  private async finishDownload(downloadId: string) {
    const download = await this.downloadDb.get(downloadId);

    if (!download) {
      console.error("Download not found");
      return;
    }

    await this.downloadDb.update(downloadId, {
      downloadedSize: download.totalSize,
      downloadRate: 0,
      peers: 0,
      progress: 100,
      seeders: 0,
      status: "COMPLETED",
    });
  }

  private async updateDownloadToError(downloadId: string) {
    await this.downloadDb.update(downloadId, {
      status: "ERROR",
    });
  }
}
