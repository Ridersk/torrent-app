import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "./pages/Home";

const AppStack = createNativeStackNavigator();

const Routes = () => {
  return (
    <NavigationContainer>
      <AppStack.Navigator>
        <AppStack.Screen name="Home" component={Home}></AppStack.Screen>
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
