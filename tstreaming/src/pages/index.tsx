import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import Downloads from "./Downloads";
import DownloadDetails from "./DownloadDetails";

const AppStack = createNativeStackNavigator();


const Routes = () => {
  return (
    <NavigationContainer>
      <AppStack.Navigator>
        <AppStack.Screen name="Downloads" component={Downloads} />
        <AppStack.Screen name="DownloadDetails" component={DownloadDetails} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
