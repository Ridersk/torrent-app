import React, {useEffect, useRef, useState} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import Video from "react-native-video";
import Orientation from "react-native-orientation";

import styles from "./styles";
import {RouteProp, useRoute} from "@react-navigation/native";
import {AppRouteParams} from "../types";

export default () => {
  const route = useRoute<RouteProp<AppRouteParams>>();
  const videoSource: string = route.params?.source;
  const videoPlayerRef = useRef<Video>(null);

  useEffect(() => {
    console.log("Video source:", videoSource);
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [videoSource]);

  function handleError(error: any) {
    console.error("Video Error:", error);
  }

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    console.log("toggleFullscreen");
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoPlayerRef}
        source={{uri: videoSource}}
        onError={handleError}
        style={styles.videoPlayer}
        fullscreen={isFullscreen}
        resizeMode={"contain"}
        controls={true}
      />
      <View style={styles.fullscreenButtonContainer}>
        <TouchableOpacity
          onPress={toggleFullscreen}
          style={styles.fullscreenButton}>
          <Text>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
