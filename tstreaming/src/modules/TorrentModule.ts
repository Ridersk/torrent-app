import {NativeModules} from "react-native";

const {TorrentModule} = NativeModules;

export type AlertType =
  | "TORRENT_INFO"
  | "ADD_TORRENT"
  | "METADATA_RECEIVED"
  | "BLOCK_FINISHED"
  | "PIECE_FINISHED"
  | "TORRENT_FINISHED"
  | "STATE_UPDATE"
  | "TORRENT_ERROR"
  | "DHT_ERROR"
  | "ERROR";

export interface TorrentModuleInterface {
  add(downloadId: string, magnetLink: string): void;
  pause(downloadId: string): Promise<void>;
  resume(downloadId: string): Promise<void>;
  resume(downloadId: string, magnetLink: string): void;
  remove(downloadId: string): Promise<void>;
}

export default TorrentModule as TorrentModuleInterface;
