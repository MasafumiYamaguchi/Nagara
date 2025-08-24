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
  Icon,
  Divider,
} from "native-base";
import React, { useEffect, useState } from "react";
import { MaterialIcons } from '@expo/vector-icons';

import { RootStackParamList } from "./navigation/types";
import { signIn, signInWithGoogle } from "../src/services/authService"; // 変更

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Google認証ローディング用
  const toast = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.show({ description: "メールアドレスとパスワードを入力してください" });
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
      // ログイン成功時の画面遷移は onAuthStateChanged で処理されるため、
      // ここでの明示的な navigation.navigate は不要になる場合があります。
      // 必要に応じて成功時の処理を追加してください。
      toast.show({
        title: "ログイン成功",
        variant: "solid",
      });
    } catch (error: any) {
      toast.show({
        description: error.message || "ログインに失敗しました",
        variant: "subtle",
        colorScheme: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Googleログイン処理
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.show({
        title: "Googleログイン成功",
        variant: "solid",
      });
    } catch (error: any) {
      toast.show({
        description: error.message || "Googleログインに失敗しました",
        variant: "subtle",
        colorScheme: "danger",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Center flex={1} px="3">
      <Box safeArea p="2" py="8" w="90%" maxW="290">
        <VStack space={3} mt="5">
          <Heading size="lg" fontWeight="600" color="coolGray.800">
            ログイン
          </Heading>
          <Text fontSize="md" color="coolGray.600">
            アカウントにサインインしてください
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

          <Button
            mt="2"
            colorScheme="indigo"
            onPress={handleLogin}
            isLoading={isLoading}
          >
            ログイン
          </Button>
          
          {/* Google ログインボタンの追加 */}
          <HStack my="3" alignItems="center">
            <Divider flex={1} />
            <Text mx="2" fontSize="xs" color="muted.400">または</Text>
            <Divider flex={1} />
          </HStack>
          
          <Button
            leftIcon={<Icon as={MaterialIcons} name="login" size="sm" />}
            colorScheme="red"
            onPress={handleGoogleLogin}
            isLoading={isGoogleLoading}
            _text={{ color: "white" }}
          >
            Googleでログイン
          </Button>

          <HStack mt="6" justifyContent="center">
            <Text fontSize="sm" color="coolGray.600">
              アカウントをお持ちでない方は{" "}
            </Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text fontSize="sm" color="indigo.500" fontWeight="medium">
                新規登録
              </Text>
            </Pressable>
          </HStack>

          <Button
            variant="ghost"
            colorScheme="coolGray"
            mt="4"
            onPress={() => navigation.goBack()}
          >
            戻る
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}
