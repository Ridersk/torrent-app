import React, {useCallback, useState} from "react";
import {FlatList, Modal, Text, TouchableOpacity, View} from "react-native";

import styles from "./styles";

export type VideoCaption = {
  title?: string | undefined;
  language?: string | undefined;
  type: "application/x-subrip" | "application/ttml+xml" | "text/vtt";
  uri: string;
};

export type SelectedCaption = {
  type: "system" | "disabled" | "title" | "language" | "index";
  value?: string | number | undefined;
};

type Props = {
  visible: boolean;
  captionOptions: Array<VideoCaption>;
  onClose: (captionIdx: number | undefined) => void;
};

export default (props: Props) => {
  const {visible, captionOptions, onClose} = props;
  const [selectedCaptionIdx, setSelectedCaptionIdx] = useState<number>();

  const closeModal = useCallback(() => {
    onClose(selectedCaptionIdx);
  }, [onClose, selectedCaptionIdx]);

  function handleSelect(captionIdx: number | undefined) {
    setSelectedCaptionIdx(captionIdx);
  }

  function disableCaption() {
    handleSelect(undefined);
    onClose(undefined);
  }

  function renderCaptionOption({
    item,
    index,
  }: {
    item: VideoCaption;
    index: number;
  }) {
    return (
      <View
        style={
          selectedCaptionIdx === index
            ? styles.selectedCaptionItem
            : styles.captionItem
        }>
        <TouchableOpacity onPress={() => handleSelect(index)}>
          <Text style={styles.captionItemText}>{item.language}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={closeModal}>
      <View style={styles.container}>
        <Text style={styles.title}>Subtitles</Text>
        <FlatList
          style={styles.captionList}
          data={captionOptions}
          renderItem={renderCaptionOption}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={closeModal}>
            <Text style={styles.toolbarButton}>Select</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={disableCaption}>
            <Text style={styles.toolbarButton}>Disable</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
