import React, {useEffect, useState} from "react";
import {View} from "react-native";

import styles from "./styles";
import DownloadManager from "../../services/downloadManager";
import {DownloadModel} from "../../models/download";
import Search from "../../components/Search";
import DownloadList, {ActionType} from "./List";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {AppRouteParams} from "../types";

export default () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppRouteParams>>();
  const downloadManager = DownloadManager.getInstance();
  const [downloads, setDownloads] = useState<DownloadModel[]>([]);
  const [, updateState] = React.useState<object>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  async function handleAddTorrent(magnetLink: string) {
    console.log("Add download:", magnetLink);
    await downloadManager.add(magnetLink);
  }

  useEffect(() => {
    downloadManager.getDownloadsListener(_downloads => {
      setDownloads(_downloads);
      forceUpdate();
    });
    downloadManager.pauseUnfinishedDownloads();
  }, [downloadManager, forceUpdate]);

  async function handleDownloadListAction(action: ActionType, id: string) {
    console.log("Handle action:", action, id);
    switch (action) {
      case "resume":
        await downloadManager.resume(id);
        break;
      case "pause":
        await downloadManager.pause(id);
        break;
      case "restart":
        await downloadManager.restart(id);
        break;
      case "remove":
        await downloadManager.remove(id);
        break;
    }
  }

  function handleOpenDownloadDetailPage(id: string): void {
    console.log("Open download detail:", id);
    navigation.navigate("DownloadDetails", {id});
  }

  return (
    <View style={styles.container}>
      <Search onSubmit={handleAddTorrent} />
      <DownloadList
        items={downloads}
        onAction={handleDownloadListAction}
        onSelect={handleOpenDownloadDetailPage}
      />
    </View>
  );
};
