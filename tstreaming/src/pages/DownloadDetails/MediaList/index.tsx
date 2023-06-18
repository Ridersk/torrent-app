import React, {useEffect, useState} from "react";
import {Text, TouchableOpacity, View} from "react-native";

import {
  getExtensionFromFilename,
  getFilesByExtensionTypes,
  getFilesByExtensionTypesRecursive,
} from "../../../utils/files";
import styles from "./styles";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {AppRouteParams} from "../../types";
import {Media} from "../../../models/media";

const ALLOWED_EXTENSIONS = ["mp4"];

type Props = {
  folderPath: string;
};

export default (props: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppRouteParams>>();
  const {folderPath} = props;
  const [mediasFound, setMediasFound] = useState<Media[]>();

  useEffect(() => {
    if (folderPath) {
      getFilesByExtensionTypesRecursive(folderPath, ALLOWED_EXTENSIONS).then(
        files => {
          if (files.length > 0) {
            setMediasFound(
              files.map(file => ({
                name: file.name,
                path: `${folderPath}/${file.name}`,
                type: getExtensionFromFilename(file.name),
              })),
            );
            console.log("Files:", files);
          }
        },
      );
    }
  }, [folderPath]);

  function handleOpenMediaRunner(media: Media): void {
    console.log("Open MediaRunner for:", media);
    if (media.type === "mp4") {
      navigation.navigate("VideoPlayer", {media: media});
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medias:</Text>
      {mediasFound !== undefined ? (
        mediasFound.length > 0 ? (
          <View>
            {mediasFound.map((media, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleOpenMediaRunner(media)}>
                <Text style={styles.mediaText}>{media.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <Text style={styles.mediaText}>No media found</Text>
          </View>
        )
      ) : (
        <View>
          <Text style={styles.mediaText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};
