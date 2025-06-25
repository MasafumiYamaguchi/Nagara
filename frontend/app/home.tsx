import { Text, View } from "react-native";
import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Index({ route, navigation }: Props) {
  
  useEffect(() => {
    console.log("Home screen mounted");
    return () => {
      console.log("Home screen unmounted");
    };
  }, [route, navigation]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>This is a home screen.</Text>
    </View>
  );
}
