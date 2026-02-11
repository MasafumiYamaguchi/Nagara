import React, { useState, useEffect } from 'react'
import { Modal, VStack, HStack, Box, Heading, Text, Button, TextArea, Pressable, Center } from 'native-base'
import { KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useColorMode } from 'native-base'
import { getApp } from '@react-native-firebase/app'
import { getFirestore } from '@react-native-firebase/firestore'
import { getAuth } from '@react-native-firebase/auth'

const EditProfile = ({ isOpen, onClose, reportedUserId }: { isOpen: boolean; onClose: () => void; reportedUserId: string }) => {
  const { colorMode } = useColorMode()
  const nativeBaseColorMode = colorMode
  
  const [profileField, setProfileField] = useState('')

  const app = getApp()
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    if (isOpen) {
      // モーダルが開いたときに現在のプロフィール情報を取得してセットする処理
      const fetchProfile = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
          const userDoc = await db.collection('users').doc(currentUser.uid).get();
            const userData = userDoc.data();
            setProfileField(userData?.profileField || '');
        } catch (e) {
          console.warn('プロフィール情報の取得に失敗しました', e);
        }
      };

      fetchProfile();
    }
  }, [isOpen, auth, db]);

  const handleProfileUpdate = async () => {
    if (!profileField) return

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('エラー', 'ログインが必要です。');
      return 'User not logged in';
    }
    
    try {
      await db.collection('users').doc(currentUser.uid).update({
        profileField,
        updatedAt: new Date(),
      })
      Alert.alert('更新完了', 'プロフィールを更新しました。');
    } catch (e) {
      console.warn('プロフィール更新に失敗しました', e);
      Alert.alert('エラー', 'プロフィール更新に失敗しました。もう一度お試しください。');
      return `Profile update failed: ${e}`;
    }
    console.log('プロフィール更新:', { profileField })
    
    setProfileField('')
    onClose()
  }

  const handleCancel = () => {
    setProfileField('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <>
        <Pressable
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          bg="black"
          opacity={0.35}
          onPress={handleCancel}
          zIndex={10}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 11,
          }}
        >
          <Center flex={1} px={4}>
            <Box
              bg={nativeBaseColorMode === "dark" ? "gray.800" : "white"}
              borderRadius="2xl"
              p={5}
              shadow={8}
              borderWidth={1}
              borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
              w="100%"
              maxW="95%"
            >
              <VStack space={4}>
                <Heading size="md" color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}>
                  プロフィール編集
                </Heading>
                
                <Text fontSize="sm" color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}>
                  ひとことや自己紹介を更新しよう
                </Text>

                <TextArea
                  placeholder={profileField ? undefined : "プロフィール情報を入力してください"}
                  value={profileField}
                  onChangeText={setProfileField}
                  totalLines={4}
                  borderRadius="lg"
                  px={4}
                  py={3}
                  fontSize="md"
                  _focus={{
                    borderColor: "primary.500",
                  }}
                  bg={nativeBaseColorMode === "dark" ? "gray.900" : "gray.50"}
                  autoCompleteType={false}
                />

                <HStack mt={2} justifyContent="flex-end" space={3}>
                  <Button
                    variant="outline"
                    onPress={handleCancel}
                  >
                    キャンセル
                  </Button>

                  <Button
                    variant="solid"
                    colorScheme="primary"
                    onPress={handleProfileUpdate}
                    isDisabled={!profileField}
                  >
                    更新する
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Center>
        </KeyboardAvoidingView>
      </>
    </Modal>
  )
}

export default EditProfile