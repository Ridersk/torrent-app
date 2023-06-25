import Realm from "realm";
import {DownloadModel} from "../../../models/download";

export class DownloadObject extends Realm.Object<DownloadModel> {
  static schema = {
    name: "DownloadObject",
    primaryKey: "_id",
    properties: {
      _id: {type: "string", indexed: true},
      downloadedSize: "int",
      downloadRate: "int",
      location: "string?",
      name: "string",
      peers: "int",
      progress: "int",
      seeders: "int",
      source: "string",
      status: "string",
      totalSize: "int",
    },
  };
}
