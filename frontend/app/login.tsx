import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation/types";
import React, { useEffect } from "react";
import { Text, View, Button, TextInput } from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation, route }: Props) {

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  useEffect(() => {
    console.log("Login screen mounted");
    return () => {
      console.log("Login screen unmounted");
    };
  }, []);

  return (
    <View className="flex-1 justify-center items-center px-4 bg-gray-50">
      <View className="w-full max-w-sm">
        <Text className="text-2xl font-bold text-gray-800 mb-8 text-center">
          ログイン
        </Text>
        <TextInput 
          className="h-12 border border-gray-300 rounded-lg px-4 text-gray-700 mb-4 bg-white"
          placeholder="ユーザー名"
          placeholderTextColor="#9CA3AF"
          onChangeText={setUsername}
        />
        <TextInput 
          className="h-12 border border-gray-300 rounded-lg px-4 text-gray-700 mb-4 bg-white"
          placeholder="パスワード"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={true}
          onChangeText={setPassword}
        />
        <View className="mt-2">
          <View className="bg-blue-600 rounded-lg w-1/3 mx-auto">
            <Button
              color="#FFFFFF"
              title="ログイン"
              onPress={() => {
                if (!username || !password) {
                  alert("ユーザー名とパスワードを入力してください");
                  return;
                }
                console.log("Login button pressed");
                navigation.navigate("Home");
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
