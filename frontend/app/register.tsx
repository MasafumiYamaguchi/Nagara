import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Box,
  VStack,
  FormControl,
  Input,
  Button,
  Heading,
  Text,
  HStack,
  Center,
  useToast,
  Pressable,
} from "native-base";
import React, { useState } from "react";

import { RootStackParamList } from "./navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const toast = useToast();

  const handleRegister = () => {
    if (!email || !password || !passwordConfirmation) {
      alert("すべての項目を入力してください");
      return;
    }
    if (password !== passwordConfirmation) {
      alert("パスワードが一致しません");
      return;
    }

    // 新規登録成功時はホーム画面に遷移
    toast.show({
      title: "新規登録成功",
      description: "ホーム画面に移動します",
      variant: "solid",
    });

    setTimeout(() => {
      navigation.navigate("Home");
    }, 1000);
  };

  return (
    <Center flex={1} px="3">
      <Box safeArea p="2" py="8" w="90%" maxW="290">
        <VStack space={3} mt="5">
          <Heading size="lg" fontWeight="600" color="coolGray.800">
            新規登録
          </Heading>
          <Text fontSize="md" color="coolGray.600">
            新しいアカウントを作成します
          </Text>

          <FormControl>
            <FormControl.Label>メールアドレス</FormControl.Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="メールアドレスを入力"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>パスワード</FormControl.Label>
            <Input
              type="password"
              value={password}
              onChangeText={setPassword}
              placeholder="パスワードを入力"
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>パスワード (確認用)</FormControl.Label>
            <Input
              type="password"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              placeholder="パスワードを再入力"
            />
          </FormControl>

          <Button mt="2" colorScheme="indigo" onPress={handleRegister}>
            登録する
          </Button>

          <HStack mt="6" justifyContent="center">
            <Text fontSize="sm" color="coolGray.600">
              アカウントをお持ちの方は{" "}
            </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text fontSize="sm" color="indigo.500" fontWeight="medium">
                ログイン
              </Text>
            </Pressable>
          </HStack>
        </VStack>
      </Box>
    </Center>
  );
}
