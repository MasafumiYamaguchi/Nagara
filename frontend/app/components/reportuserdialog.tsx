import React, { useState } from 'react'
import { Modal, VStack, HStack, Box, Heading, Text, Button, TextArea, Radio, Pressable, Center } from 'native-base'
import { KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useColorMode } from 'native-base'
import { getApp } from '@react-native-firebase/app'
import { getFirestore } from '@react-native-firebase/firestore'
import { getAuth } from '@react-native-firebase/auth'

const ReportUserDialog = ({ isOpen, onClose, reportedUserId }: { isOpen: boolean; onClose: () => void; reportedUserId: string }) => {
  const { colorMode } = useColorMode()
  const nativeBaseColorMode = colorMode
  
  const [reportReason, setReportReason] = useState('')
  const [reportDetail, setReportDetail] = useState('')

  const reportReasons = [
    { value: 'spam', label: 'スパム・宣伝行為' },
    { value: 'harassment', label: '嫌がらせ・誹謗中傷' },
    { value: 'inappropriate', label: '不適切な内容' },
    { value: 'impersonation', label: 'なりすまし' },
    { value: 'other', label: 'その他' },
  ]

  const app = getApp()
  const db = getFirestore(app);
  const auth = getAuth(app);

  const handleSubmitReport = async () => {
    if (!reportReason) return

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('エラー', 'ログインが必要です。');
      return 'User not logged in';
    }
    
    // ここで通報処理のAPI呼ぶ感じ
    try {
      
      await db.collection('reports').add({
        reporterId: currentUser.uid,
        displayName: await getDisplayName(currentUser.uid),
        reportedUserId,
        reportReason,
        reportDetail,
        createdAt: new Date(),
      })
      Alert.alert('通報完了', '通報ありがとうございました。運営チームが内容を確認します。');
    } catch (e) {
      console.warn('通報処理に失敗しました', e);
      Alert.alert('エラー', '通報処理に失敗しました。もう一度お試しください。');
      return `User report failed: ${e}`;
    }
    console.log('通報:', { reportedUserId, reportReason, reportDetail })
    
    // リセットして閉じる
    setReportReason('')
    setReportDetail('')
    onClose()
  }

  const handleCancel = () => {
    setReportReason('')
    setReportDetail('')
    onClose()
  }

  const getDisplayName = async (userId: string) => {
    if (!userId) return '不明なユーザー';

    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        const fallback = `user-${userId.substring(0, 6)}`;
        return fallback;
      }
      const userData = userDoc.data();
      const displayName = userData?.displayName || `user-${userId.substring(0, 6)}`;
      return displayName;
    } catch (e) {
      console.warn('ユーザー情報の取得に失敗しました', e);
      return '不明なユーザー';
    }
  };

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
              borderRadius="lg"
              p={4}
              shadow={6}
              borderWidth={1}
              borderColor={nativeBaseColorMode === "dark" ? "gray.700" : "gray.200"}
              w="100%"
              maxW="95%"
            >
              <VStack space={4}>
                <Heading size="md" color={nativeBaseColorMode === "dark" ? "gray.100" : "gray.900"}>
                  ユーザーを通報
                </Heading>
                
                <Text fontSize="sm" color={nativeBaseColorMode === "dark" ? "gray.400" : "gray.600"}>
                  通報理由を選択してください
                </Text>

                <Radio.Group 
                  name="reportReason" 
                  value={reportReason} 
                  onChange={setReportReason}
                >
                  <VStack space={3}>
                    {reportReasons.map((reason) => (
                      <Radio 
                        key={reason.value} 
                        value={reason.value}
                        colorScheme="red"
                      >
                        {reason.label}
                      </Radio>
                    ))}
                  </VStack>
                </Radio.Group>

                <TextArea
                  placeholder="詳細を入力してください（任意）"
                  value={reportDetail}
                  onChangeText={setReportDetail}
                  totalLines={4}
                  borderRadius="md"
                  px={4}
                  py={3}
                  fontSize="md"
                  _focus={{
                    borderColor: "red.500",
                  }}
                  autoCompleteType={false}
                />

                <HStack mt={4} justifyContent="flex-end" space={3}>
                  <Button
                    variant="outline"
                    onPress={handleCancel}
                  >
                    キャンセル
                  </Button>

                  <Button
                    variant="solid"
                    colorScheme="red"
                    onPress={handleSubmitReport}
                    isDisabled={!reportReason}
                  >
                    通報する
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

export default ReportUserDialog