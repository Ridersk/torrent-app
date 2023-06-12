import React, {useEffect, useState} from "react";
import {View, Text, FlatList, TouchableOpacity} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

import styles from "./styles";
import {DownloadManager} from "../../services/downloadManager";
import {DownloadModel} from "../../models/download";
import Search from "../../components/Search";

export default () => {
  const downloadManager = new DownloadManager();
  const [downloads, setDownloads] = useState<DownloadModel[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);

  async function handleAddTorrent(magnetLink: string) {
    console.log("Add download:", magnetLink);
    await downloadManager.add(magnetLink);
  }

  useEffect(() => {
    downloadManager.getDownloadsListener(_downloads => {
      setRefresh(true);
      setDownloads(_downloads);
      setRefresh(false);
    });
    downloadManager.pauseUnfinishedDownloads();
  }, []);

  function renderDownload({item}: {item: DownloadModel}) {
    async function handleResume() {
      await downloadManager.resume(item._id);
    }

    async function handlePause() {
      await downloadManager.pause(item._id);
    }

    async function handleRestart() {
      await downloadManager.restart(item._id);
    }

    return (
      <View style={styles.downloadItemContainer}>
        <View style={styles.downloadItemTitle}>
          <Text>{item.name}</Text>
        </View>
        <View style={styles.downloadItemActions}>
          <Text>{item.progress}</Text>
          {item.status === "PAUSED" && (
            <TouchableOpacity onPress={handleResume}>
              <Icon name="play" size={24} color="#696969" />
            </TouchableOpacity>
          )}
          {item.status === "DOWNLOADING" && (
            <TouchableOpacity onPress={handlePause}>
              <Icon name="pause" size={24} color="#696969" />
            </TouchableOpacity>
          )}
          {(item.status === "COMPLETED" || item.status === "ERROR") && (
            <TouchableOpacity onPress={handleRestart}>
              <Icon name="rotate-right" size={24} color="#696969" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Search onSubmit={handleAddTorrent} />
      <FlatList
        style={styles.downloadList}
        keyExtractor={(item, index) => index.toString()}
        data={downloads}
        refreshing={refresh}
        renderItem={renderDownload}
      />
    </View>
  );
};
