import React from "react";
import {Text, TouchableOpacity, View} from "react-native";
import styles from "./styles";
import Icon from "react-native-vector-icons/FontAwesome";
import {DownloadModel} from "../../../../models/download";

type Props = {
  item: DownloadModel;
  onResume: () => Promise<void>;
  onPause: () => Promise<void>;
  onRestart: () => Promise<void>;
  onRemove: () => Promise<void>;
};

export default ({item, onResume, onPause, onRestart, onRemove}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.itemTitle}>
        <Text>{item.name}</Text>
      </View>
      <View style={styles.itemAction}>
        <Text>{item.progress}</Text>
        {item.status === "PAUSED" && (
          <TouchableOpacity onPress={onResume}>
            <Icon name="play" size={24} color="#696969" />
          </TouchableOpacity>
        )}
        {item.status === "DOWNLOADING" && (
          <TouchableOpacity onPress={onPause}>
            <Icon name="pause" size={24} color="#696969" />
          </TouchableOpacity>
        )}
        {(item.status === "COMPLETED" || item.status === "ERROR") && (
          <TouchableOpacity onPress={onRestart}>
            <Icon name="rotate-right" size={24} color="#696969" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onRemove}>
          <Icon name="trash" size={24} color="#696969" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
