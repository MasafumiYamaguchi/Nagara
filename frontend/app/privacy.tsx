import React from 'react'
import { Box, Button, Text, VStack } from 'native-base'
import { NativeStackScreenProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { RootStackParamList } from "./navigation/types";
import { PermissionsAndroid, Platform } from 'react-native';
import { Audio } from 'expo-av';

type Props = NativeStackScreenProps<RootStackParamList, "Privacy">;

const PrivacyScreen = ({navigation, route}: Props) => {

    const requestMicPermission = async () => {
        if (Platform.OS === 'ios') {
            // iOSはこれでOK（初回はダイアログが出る）
            const { status } = await Audio.requestPermissionsAsync();
            if (status === 'granted') {
                console.log('Microphone permission granted (iOS)');
            } else {
                console.log('Microphone permission denied (iOS)');
            }
            return;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: "Tsuuwa マイク使用許可",
                    message: "Tsuuwa アプリがマイクを使用することを許可しますか？",
                    buttonNeutral: "後で聞く",
                    buttonNegative: "拒否",
                    buttonPositive: "許可"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the microphone (Android)");
            } else {
                console.log("Microphone permission denied (Android)");
            }
        } catch (err) {
            console.warn(err);
        }
    };

  return (
    <Box flex={1} justifyContent="center" alignItems="center">
        <VStack space={4} alignItems="center">
            <Text>Privacy Screen</Text>
            <Button onPress={() => navigation.goBack()}>
                戻る
            </Button>
            <Button onPress={requestMicPermission}>
                マイク許可をリクエスト
            </Button>
        </VStack>
    </Box>
  )
}

export default PrivacyScreen