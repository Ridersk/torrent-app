import { createContext } from "react";
import DownloadManager from "./downloadManager";
import { RealmDatabase } from "../database/realm";
import { DownloadModel } from "../models/download";
import { DownloadObject } from "../database/realm/objects/download";

export const DownloadManagerProvider = createContext<DownloadManager>(
  DownloadManager.getInstance(
    new RealmDatabase<DownloadModel>(DownloadObject, DownloadModel),
  ),
);
