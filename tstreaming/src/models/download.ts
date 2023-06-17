type DownloadStatus = "DOWNLOADING" | "PAUSED" | "COMPLETED" | "ERROR";

export class DownloadModel {
  _id: string;
  downloadedSize: number;
  downloadRate: number;
  location?: string;
  name: string;
  peers: number;
  progress: number;
  seeders: number;
  source: string;
  status: DownloadStatus;
  totalSize: number;

  constructor(
    _id: string,
    downloadedSize: number,
    downloadRate: number,
    location: string,
    name: string,
    peers: number,
    progress: number,
    seeders: number,
    source: string,
    status: DownloadStatus,
    totalSize: number,
  ) {
    this._id = _id;
    this.downloadedSize = downloadedSize;
    this.downloadRate = downloadRate;
    this.location = location;
    this.name = name;
    this.peers = peers;
    this.progress = progress;
    this.seeders = seeders;
    this.source = source;
    this.status = status;
    this.totalSize = totalSize;
  }

  static from(realmObject: any) {
    return new DownloadModel(
      realmObject._id,
      realmObject.downloadedSize,
      realmObject.downloadRate,
      realmObject.location,
      realmObject.name,
      realmObject.peers,
      realmObject.progress,
      realmObject.seeders,
      realmObject.source,
      realmObject.status,
      realmObject.totalSize,
    );
  }
}
