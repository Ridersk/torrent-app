import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import Downloads from "./Downloads";

const AppStack = createNativeStackNavigator();

const Routes = () => {
  return (
    <NavigationContainer>
      <AppStack.Navigator>
        <AppStack.Screen name="Downloads" component={Downloads} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
