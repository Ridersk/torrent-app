import {StyleSheet} from "react-native";

export default StyleSheet.create({
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
