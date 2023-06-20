import {BaseModel} from "./@base";

type DownloadStatus = "DOWNLOADING" | "PAUSED" | "COMPLETED" | "ERROR";

export class DownloadModel extends BaseModel {
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
    super(_id);
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

  static from(data: any) {
    return new DownloadModel(
      data._id,
      data.downloadedSize,
      data.downloadRate,
      data.location,
      data.name,
      data.peers,
      data.progress,
      data.seeders,
      data.source,
      data.status,
      data.totalSize,
    );
  }
}
