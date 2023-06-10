import React, {useEffect, useState} from "react";
import {View, Text, FlatList} from "react-native";

import styles from "./styles";
import {DownloadManager} from "../../services/downloadManager";
import {DownloadModel} from "../../models/download";
import Search from "../../components/Search";

export default () => {
  const downloadManager = new DownloadManager();
  const [downloads, setDownloads] = useState<DownloadModel[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);

  async function handleDownload(magnetLink: string) {
    console.log("Add download:", magnetLink);
    await downloadManager.download(magnetLink);
  }

  useEffect(() => {
    downloadManager.getDownloadsListener(_downloads => {
      setRefresh(true);
      setDownloads(_downloads);
      setRefresh(false);
    });
  }, []);

  function renderDownload({item}: {item: DownloadModel}) {
    return (
      <View style={styles.downloadItem}>
        <Text>{item.name}</Text>
        <Text>{item.progress}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Search onSubmit={handleDownload} />
      <FlatList
        style={styles.downloadsList}
        keyExtractor={(item, index) => index.toString()}
        data={downloads}
        refreshing={refresh}
        renderItem={renderDownload}
      />
    </View>
  );
};
