import {StyleSheet} from "react-native";

export default StyleSheet.create({
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
  customControlsContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  customControlsBtnActionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  customControlBtn: {
    padding: 8,
    borderRadius: 4,
  },
});
