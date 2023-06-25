import {StyleSheet} from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#ecf0f1",
  },
  video: {
    alignSelf: "center",
    width: 320,
    height: 200,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  downloadList: {
    flex: 1,
    marginTop: 10,
  },
  downloadItemContainer: {
    padding: 10,
    fontSize: 18,
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  downloadItemTitle: {
    flex: 8,
    fontSize: 18,
  },
  downloadItemActions: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
