import React, {useState, useEffect} from "react";
import {View, ScrollView, Text, DeviceEventEmitter} from "react-native";

import {styles} from "./styles";
import NativeTorrentModule from "../../modules/NativeTorrentModule";
import {RealmDatabase} from "../../database/realm";
import {DownloadObject} from "../../database/realm/objects/download";
import { DownloadModel } from "../../models/download";

export default () => {
  const downloadDb = new RealmDatabase(DownloadObject);
  const [progress, setProgress] = useState(0);

  const fetchTorrent = () => {
    console.log("Starting Torrent...");

    DeviceEventEmitter.addListener("PIECE_FINISHED", data => {
      console.log("Progress: ", data);
      setProgress(data);
    });
    DeviceEventEmitter.addListener("METADATA_RECEIVED", data =>
      console.log("Metadata: ", data),
    );
    DeviceEventEmitter.addListener("TORRENT_INFO", data =>
      console.log("Torrent info: ", data),
    );
    DeviceEventEmitter.addListener("ERROR", data =>
      console.error("Error: ", data),
    );

    NativeTorrentModule.download(
      "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent",
    );
  };

  const createDownload = async () => {
    const download = await downloadDb.create({
      name: "Sintel",
      location: "downloads/sintel",
    });

    console.log(`Download created: ${download.constructor.name} `, download);

    const downloads = await downloadDb.getAll();
    console.log(`Downloads: (${downloads.length}):`, downloads);
  };

  useEffect(() => {
    // fetchTorrent();
    createDownload();
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.sectionTitle}>Progress: {progress}</Text>
      </View>
    </ScrollView>
  );
};
