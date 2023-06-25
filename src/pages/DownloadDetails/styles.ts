import {StyleSheet} from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#ecf0f1",
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
  descriptionContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  descriptionLabel: {
    fontSize: 16,
    textAlign: "left",
    margin: 10,
    fontWeight: "bold",
  },
  descriptionText: {
    fontSize: 16,
    textAlign: "left",
    margin: 10,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "column",
  },
  progressLabel: {
    fontSize: 20,
    textAlign: "left",
    margin: 10,
    fontWeight: "bold",
  },
  progress: {
    margin: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    color: "#bdc3c7 !important",
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: "#737373",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mediaContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  mediaTitle: {
    fontSize: 24,
    textAlign: "left",
    margin: 10,
    fontWeight: "bold",
  },
  mediaText: {
    fontSize: 16,
    textAlign: "left",
    margin: 10,
  },
});
