import {
  Box,
  VStack,
  Button,
  Heading,
  Text,
  useToast,
  Icon,
} from "native-base";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithApple } from '../src/services/appleAuth';

import { signInWithGoogle, reloadUserProfile } from "../src/services/authService";

import { log, getCrashlytics } from "@react-native-firebase/crashlytics";

export default function LoginScreen() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); 
  const toast = useToast();

  const crashlytics = getCrashlytics();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();

      // Firebaseユーザー情報を最新化 + Firestore同期
      await reloadUserProfile();

      toast.show({
        title: "Googleログイン成功",
        variant: "solid",
      });
    } catch (error) {
      toast.show({
        description: "Googleログインに失敗しました",
        variant: "subtle",
        colorScheme: "danger",
      });
      log(crashlytics, String(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onAppleLoginPress = async () => {
    try {
      const result = await signInWithApple();
      await reloadUserProfile({
        displayName: result.appleFullName,
        email: result.appleEmail,
      });

      toast.show({
        title: 'Appleログイン成功',
        variant: 'solid',
      });
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err?.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Appleログイン失敗', err?.message ?? '不明なエラー');
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

          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={8}
              style={{ width: '100%', height: 44, marginTop: 12 }}
              onPress={onAppleLoginPress}
            />
          )}
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
