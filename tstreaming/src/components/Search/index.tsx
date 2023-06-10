import React, {useState} from "react";
import {Button, TextInput, View} from "react-native";

import styles from "./styles";
import {SafeAreaView} from "react-native-safe-area-context";

type Props = {
  onSubmit: (text: string) => void;
};

export default (props: Props) => {
  const [text, setText] = useState<string>(
    "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent",
  );
  const {onSubmit} = props;

  function handleSubmit() {
    onSubmit(text);
  }

  return (
    <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.input}
          value={text}
          placeholder="Add a magnet link"
          keyboardType="default"
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
        />
        <View style={styles.btnContainer}>
          <Button title="Add" onPress={handleSubmit} />
        </View>
    </SafeAreaView>
  );
};
