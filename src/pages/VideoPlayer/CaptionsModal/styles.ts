import {StyleSheet} from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  captionList: {
    flex: 1,
    backgroundColor: "black",
  },
  captionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  selectedCaptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  captionItemText: {
    color: "white",
    fontSize: 16,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "black",
    padding: 10,
  },
  toolbarButton: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginHorizontal: 10,
  },
});
