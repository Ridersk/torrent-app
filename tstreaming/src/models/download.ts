type DownloadStatus = "DOWNLOADING" | "PAUSED" | "COMPLETED" | "ERROR";

export interface DownloadModel {
  _id: string;
  name: string;
  location?: string;
  source: string;
  status: DownloadStatus;
  progress: number;
}
