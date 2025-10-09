import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Center, VStack, Heading, Button, Text } from "native-base";
import React, { useEffect } from "react";

import { RootStackParamList } from "./navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Index">;

export default function Index({ route, navigation }: Props) {
  useEffect(() => {
    console.log("Index screen mounted");

    const timer = setTimeout(() => {
      navigation.navigate("Login");
    }, 1000);

    return () => {
      clearTimeout(timer);
      console.log("Index screen unmounted");
    };
  }, [route, navigation]);

  return (
    <Center flex={1} px="3">
      <VStack space={4} alignItems="center">
        <Heading size="xl" color="coolGray.800">
          Tsuuwa
        </Heading>
        <Text fontSize="md" color="coolGray.600" textAlign="center">
          音声通話アプリへようこそ
        </Text>

        <VStack space={3} mt="8" w="80%">
          <Button
            colorScheme="indigo"
            size="lg"
            onPress={() => navigation.navigate("Login")}
          >
            ログイン
          </Button>

          <Button
            variant="outline"
            colorScheme="indigo"
            size="lg"
            onPress={() => navigation.navigate("Main")}
          >
            ホームへ
          </Button>
        </VStack>
      </VStack>
    </Center>
  );
}
