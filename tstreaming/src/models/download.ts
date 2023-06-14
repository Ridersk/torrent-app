type DownloadStatus = "DOWNLOADING" | "PAUSED" | "COMPLETED" | "ERROR";

export interface DownloadModel {
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
}
