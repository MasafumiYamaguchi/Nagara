import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { VStack, Heading, Button, Text } from "native-base";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { RootStackParamList } from "./navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Index">;

export default function Index({ route, navigation }: Props) {
  useEffect(() => {
    console.log("Index screen mounted");

    // E2Eテスト中はタイマーをもうちょい長めに
    const isE2E = __DEV__ && process.env.DETOX_CONFIGURATION !== undefined;
    const timer = setTimeout(() => {
      navigation.navigate("Login");
    }, isE2E ? 3000 : 1000);

    return () => {
      clearTimeout(timer);
      console.log("Index screen unmounted");
    };
  }, [route, navigation]);

  return (
    <View style={styles.container} testID="indexScreen">
      <VStack space={4} alignItems="center">
        <Heading size="xl" color="coolGray.800">
          Nagara
        </Heading>
        <Text fontSize="md" color="coolGray.600" textAlign="center">
          作業通話アプリ『Nagara』へようこそ
        </Text>

        <VStack space={3} mt="8" w="80%">
          <Button
            colorScheme="indigo"
            size="lg"
            onPress={() => navigation.navigate("Login")}
          >
            ログイン
          </Button>
        </VStack>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
});
