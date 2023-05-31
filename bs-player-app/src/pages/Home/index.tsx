import React, { useState, useEffect } from "react";
import { View, Button, ActivityIndicator } from "react-native";
import { Video, ResizeMode } from "expo-av";
import * as FileSystem from "expo-file-system";

import { styles } from "./styles";

export default function App() {
  const video = React.useRef(null);
  const [status, setStatus] = useState({});
  const [downloadPogress, setDownloadProgress] = useState(0);
  const [videoUri, setVideoUri] = useState<string>();

  useEffect(() => {
    const callback = (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      setDownloadProgress(progress);
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
      FileSystem.documentDirectory + "small.mp4",
      {},
      callback
    );
    setVideoUri(FileSystem.documentDirectory + "small.mp4");
    
    (async function() {
      try {
        const { uri } = await downloadResumable.downloadAsync();
        console.log("Finished downloading to ", uri);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {!videoUri && <ActivityIndicator />}
      {videoUri &&
        <Video
          ref={video}
          style={styles.video}
          source={{
            uri: videoUri,
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        />
      }
      <View style={styles.buttons}>
        <Button
          title={status.isPlaying ? "Pause" : "Play"}
          onPress={() =>
            status.isPlaying
              ? video.current.pauseAsync()
              : video.current.playAsync()
          }
        />
      </View>
    </View>
  );
}
