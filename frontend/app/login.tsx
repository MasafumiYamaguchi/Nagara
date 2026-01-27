import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Box,
  VStack,
  Button,
  Heading,
  Text,
  useToast,
  Icon,
} from "native-base";
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

import { RootStackParamList } from "./navigation/types";
import { signInWithGoogle } from "../src/services/authService";

import { useAuthStore } from "../src/store/authStore";

import crashlytics from "@react-native-firebase/crashlytics";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); 
  const toast = useToast();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    crashlytics().log('LoginScreen mounted');
    if (user) {
      console.log('User logged in, navigating to Main');
      navigation.replace('Main');
    }
  }, [user, navigation]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.show({
        title: "Googleログイン成功",
        variant: "solid",
      });
      navigation.replace("Main");
    } catch (error) {
      toast.show({
        description:  "Googleログインに失敗しました",
        variant: "subtle",
        colorScheme: "danger",
      });
      crashlytics().recordError(error as Error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 強制的にクラッシュさせる
  /*
  const forceCrash = () => {
    crashlytics().crash();
  };
  */

  return (
    <View style={styles.container} testID="loginScreen">
      <Box safeArea p="2" py="8" w="90%" maxW="290">
        <VStack space={3} mt="5">
          <Heading size="lg" fontWeight="600" color="coolGray.800">
            ログイン
          </Heading>
          <Text fontSize="md" color="coolGray.600">
            Googleアカウントでサインインしてください
          </Text>

          <Button
            testID="googleLoginButton"
            accessibilityLabel="Googleでログイン"
            accessibilityRole="button"
            mt="10"
            leftIcon={<Icon as={MaterialIcons} name="login" size="sm" />}
            colorScheme="red"
            onPress={handleGoogleLogin}
            isLoading={isGoogleLoading}
            _text={{ color: "white" }}
          >
            Googleでログイン
          </Button>

          <Button
            variant="ghost"
            colorScheme="coolGray"
            mt="4"
            onPress={() => navigation.goBack()}
            /*
            onLongPress={() => {
                  // クラッシュを強制的に発生させる（テスト用）
                  crashlytics().log('Forcing a crash for testing purposes');
                  forceCrash();
            } }
            */
          >
            戻る
          </Button>
        </VStack>
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
});
