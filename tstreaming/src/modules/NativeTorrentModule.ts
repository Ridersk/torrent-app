import {NativeModules} from "react-native";

const {NativeTorrentModule} = NativeModules;

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

export interface NativeTorrentModuleInterface {
  download(downloadId: string, magnetLink: string): void;
}

export default NativeTorrentModule as NativeTorrentModuleInterface;
