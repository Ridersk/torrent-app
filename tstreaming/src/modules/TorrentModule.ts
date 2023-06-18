import {NativeModules} from "react-native";

const {TorrentModule} = NativeModules;

export type AlertType =
  | "ADD_TORRENT"
  | "TORRENT_INFO"
  | "PIECE_FINISHED"
  | "TORRENT_FINISHED"
  | "TORRENT_ERROR"
  | "ADD_ERROR";

export interface TorrentModuleInterface {
  add(downloadId: string, magnetLink: string): void;
  pause(downloadId: string): Promise<void>;
  resume(downloadId: string): Promise<void>;
  resume(downloadId: string, magnetLink: string): void;
  remove(downloadId: string, path: string): Promise<void>;
}

export default TorrentModule as TorrentModuleInterface;
