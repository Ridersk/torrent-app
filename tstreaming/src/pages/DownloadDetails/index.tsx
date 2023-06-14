import React, {useEffect, useState} from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Clipboard from "@react-native-community/clipboard";
import {ProgressBar} from "@react-native-community/progress-bar-android";

import styles from "./styles";
import {DownloadModel} from "../../models/download";
import {RouteProp, useRoute} from "@react-navigation/native";
import DownloadManager from "../../services/downloadManager";
import {AppRouteParams} from "../types";
import {
  convertBytesComparisonToHumanReadable,
  convertBytesToHumanReadable,
  convertBytesToHumanReadablePerSecond,
} from "../../utils/units_conversor";

export default () => {
  const route = useRoute<RouteProp<AppRouteParams>>();
  const downloadId = route.params?.id;
  const downloadManager = DownloadManager.getInstance();
  const [downloadItem, setDownloadItem] = useState<DownloadModel>();
  const [, updateState] = React.useState<object>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  useEffect(() => {
    console.log("Download id:", downloadId);
    if (downloadId) {
      downloadManager.getDownloadListener(downloadId, _downloadItem => {
        setDownloadItem(_downloadItem);
        forceUpdate();
        console.log("Download Updated:", _downloadItem);
      });
    }
  }, []);

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
  };

  return (
    <ScrollView style={styles.container}>
      {!downloadItem && <ActivityIndicator />}
      {downloadItem && (
        <View>
          <View style={styles.header}>
            <Text style={styles.title}>{downloadItem.name}</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <TouchableOpacity
              onPress={() => copyToClipboard(downloadItem.source)}>
              <Text style={styles.descriptionLabel}>Magnet link:</Text>
              <Text
                style={styles.descriptionText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {downloadItem.source}
              </Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              onPress={() => copyToClipboard(downloadItem.location as string)}>
              <Text style={styles.descriptionLabel}>Path:</Text>
              <Text
                style={styles.descriptionText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {downloadItem.location}
              </Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <View>
              <Text style={styles.descriptionLabel}>Size:</Text>
              <Text style={styles.descriptionText}>
                {convertBytesComparisonToHumanReadable(
                  downloadItem.downloadedSize,
                  downloadItem.totalSize,
                )}
              </Text>
            </View>
            <View style={styles.separator} />
            <View>
              <Text style={styles.descriptionLabel}>Speed:</Text>
              <Text style={styles.descriptionText}>
                {convertBytesToHumanReadablePerSecond(
                  downloadItem.downloadRate,
                )}
              </Text>
            </View>
            <View style={styles.separator} />
            <View>
              <Text style={styles.descriptionLabel}>Seeders/Peers:</Text>
              <Text style={styles.descriptionText}>
                {downloadItem.seeders || 0} / {downloadItem.peers || 0}
              </Text>
            </View>
            <View style={styles.separator} />
            <View>
              <Text style={styles.descriptionLabel}>Status:</Text>
              <Text style={styles.descriptionText}>{downloadItem.status}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Progress:</Text>
              <ProgressBar
                style={styles.progress}
                styleAttr="Horizontal"
                color={downloadItem.status === "COMPLETED" ? "#00FF00" : "#2196F3"}
                indeterminate={false}
                progress={downloadItem.progress / 100}
              />
            </View>
            <View style={styles.separator} />
          </View>
        </View>
      )}
    </ScrollView>
  );
};
