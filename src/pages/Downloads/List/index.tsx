import React from "react";
import {FlatList, TouchableOpacity} from "react-native";
import styles from "./styles";
import DownloadItem from "./Item";
import {DownloadModel} from "../../../models/download";

export type ActionType = "resume" | "pause" | "restart" | "remove";

type Props = {
  items: any[];
  onAction: (action: ActionType, id: string) => Promise<void>;
  onSelect: (id: string) => void;
};

export default (props: Props) => {
  const {items, onAction, onSelect} = props;

  function renderItem({item}: {item: DownloadModel}) {
    async function handleResume() {
      await onAction("resume", item._id);
    }

    async function handlePause() {
      await onAction("pause", item._id);
    }

    async function handleRestart() {
      await onAction("restart", item._id);
    }

    async function handleRemove() {
      await onAction("remove", item._id);
    }

    return (
      <TouchableOpacity onPress={() => onSelect(item._id)}>
        <DownloadItem
          item={item}
          onResume={handleResume}
          onPause={handlePause}
          onRestart={handleRestart}
          onRemove={handleRemove}
        />
      </TouchableOpacity>
    );
  }

  return (
    <FlatList
      style={styles.downloadList}
      keyExtractor={(item, index) => index.toString()}
      data={items}
      renderItem={renderItem}
    />
  );
};
