import {StyleSheet} from "react-native";

export default StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: "#000",
  // },
  // video: {
  //   flex: 1,
  //   zIndex: 9999,
  // },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  videoPlayer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  fullscreenButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 16,
  },
  fullscreenButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 4,
  },
});
