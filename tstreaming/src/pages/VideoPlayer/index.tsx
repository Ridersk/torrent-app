import React, {useEffect, useRef, useState} from "react";
import {TouchableOpacity, View} from "react-native";
import Video, {TextTrackType} from "react-native-video";
import Orientation from "react-native-orientation";
import Icon from "react-native-vector-icons/FontAwesome";

import styles from "./styles";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {AppRouteParams} from "../types";
import {Media} from "../../models/media";
import {
  getFilenameWithoutExtension,
  getFilesByPattern,
  getParentFromFilePath,
} from "../../utils/files";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import CaptionsModal, {SelectedCaption, VideoCaption} from "./CaptionsModal";

export default () => {
  const route = useRoute<RouteProp<AppRouteParams>>();
  const navigation = useNavigation<NativeStackNavigationProp<AppRouteParams>>();
  const media: Media = route.params?.media;
  const [videoCaptions, setVideoCaptions] = useState<Array<VideoCaption>>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCustomControls, setShowCustomControls] = useState(false);
  const [controlsTimeoutID, setControlsTimeoutID] = useState<number | null>(
    null,
  );
  const [captionOptionsVisible, setCaptionOptionsVisible] = useState(false);
  const videoPlayerRef = useRef<Video>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState<SelectedCaption>({
    type: "disabled",
  });

  useEffect(() => {
    if (media && media.name) {
      const mediaNameNoExtension = getFilenameWithoutExtension(media.name);
      const parentPath = getParentFromFilePath(media.path);

      getFilesByPattern(
        parentPath,
        new RegExp(`${mediaNameNoExtension}.*.srt`),
      ).then(files => {
        const captions = files.map(file => {
          return {
            title: file.name,
            language: file.name,
            type: TextTrackType.SRT,
            uri: file.path,
          };
        });
        console.log("Video captions:", captions);
        setVideoCaptions(captions);
      });
    }

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [media]);

  function handleError(error: any) {
    console.error("Video Error:", error);
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
  };

  const closePlayer = () => {
    navigation.goBack();
  };

  const handleShowCustomControls = () => {
    const newShowCustomControls = !showCustomControls;
    setShowCustomControls(newShowCustomControls);
    // Hide custom controls after 5 seconds and cancel timeout if user touch the screen again before timeout
    if (controlsTimeoutID) {
      clearTimeout(controlsTimeoutID);
      setControlsTimeoutID(null);
    }
    if (newShowCustomControls) {
      const _timeoutID = setTimeout(() => {
        setShowCustomControls(false);
      }, 5000);
      setControlsTimeoutID(_timeoutID);
    }
  };

  const handleOpenCaptionsModal = () => {
    setCaptionOptionsVisible(true);
    setVideoPaused(true);
  };

  const handleOnCloseCaptionsModal = (captionIdx: number | undefined) => {
    console.log("handleOnCloseCaptionsModal", captionIdx);

    if (captionIdx) {
      setSelectedCaption({
        type: "index",
        value: captionIdx,
      });
    } else {
      setSelectedCaption({type: "disabled"});
    }
    setCaptionOptionsVisible(false);
  };

  return (
    <View style={styles.container}>
      {videoCaptions !== undefined && (
        <CaptionsModal
          visible={captionOptionsVisible}
          captionOptions={videoCaptions}
          onClose={handleOnCloseCaptionsModal}
        />
      )}

      {videoCaptions !== undefined && (
        <Video
          style={styles.videoPlayer}
          ref={videoPlayerRef}
          source={{uri: media.path}}
          onError={handleError}
          fullscreen={isFullscreen}
          resizeMode={"contain"}
          controls={true}
          paused={videoPaused}
          textTracks={videoCaptions}
          selectedTextTrack={selectedCaption}
          onTouchEnd={handleShowCustomControls}
          onEnd={closePlayer}
        />
      )}

      {showCustomControls && (
        <View style={styles.customControlsContainer}>
          <TouchableOpacity
            onPress={closePlayer}
            style={styles.customControlBtn}>
            <Icon name="angle-left" size={24} color="#696969" />
          </TouchableOpacity>
          <View style={styles.customControlsBtnActionsContainer}>
            <TouchableOpacity
              onPress={handleOpenCaptionsModal}
              style={styles.customControlBtn}>
              <Icon name="align-center" size={24} color="#696969" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleFullscreen}
              style={styles.customControlBtn}>
              <Icon
                name={isFullscreen ? "compress" : "expand"}
                size={24}
                color="#696969"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
