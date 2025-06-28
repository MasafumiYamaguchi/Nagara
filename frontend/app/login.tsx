import React, { useState } from 'react';
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
  Pressable
} from 'native-base';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  const handleLogin = () => {
    if (!email || !password) {
      alert("メールアドレスとパスワードを入力してください");
      return;
    }
    
    // ログイン成功時はホーム画面に遷移
    toast.show({
      title: "ログイン成功",
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

          <Button mt="2" colorScheme="indigo" onPress={handleLogin}>
            ログイン
          </Button>

          <HStack mt="6" justifyContent="center">
            <Text fontSize="sm" color="coolGray.600">
              アカウントをお持ちでない方は{" "}
            </Text>
            <Pressable onPress={() => console.log("新規登録画面へ")}>
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