import { Box, Button, Divider, ScrollView, Text, VStack, useColorMode } from 'native-base'
import { NativeStackScreenProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { RootStackParamList } from "./navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PrivacyPolicyRecheck">;

const PrivacyPolicyRecheckScreen = ({navigation}: Props) => {
  const { colorMode: nativeBaseColorMode } = useColorMode();

  const bodyColor = nativeBaseColorMode === 'light' ? 'coolGray.800' : 'coolGray.100'
  const headingColor = nativeBaseColorMode === 'light' ? 'coolGray.900' : 'coolGray.50'
  const dividerColor = nativeBaseColorMode === 'light' ? 'coolGray.300' : 'coolGray.600'

  const BodyText = (props: React.ComponentProps<typeof Text>) => (
    <Text color={bodyColor} mb={2} {...props} />
  )

  const HeadingText = (props: React.ComponentProps<typeof Text>) => (
    <Text color={headingColor} fontSize="lg" fontWeight="bold" mt={4} mb={2} {...props} />
  )

  return (
    <Box flex={1} bg={nativeBaseColorMode === 'light' ? 'coolGray.50' : 'coolGray.900'}>
      <Box pt={12} bg={nativeBaseColorMode === 'light' ? 'coolGray.50' : 'coolGray.900'}/>
      
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <VStack space={1}>
          <Text fontSize="2xl" fontWeight="bold" color={headingColor} mb={4}>プライバシーポリシー</Text>

          <BodyText>
            MKapps（以下「当方」）は、本アプリケーション「Nagara」（以下「本アプリ」）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
          </BodyText>

          <Divider bg={dividerColor} my={4} />

          <HeadingText>1. 収集する情報</HeadingText>
          <BodyText>当方は、本アプリにおいて以下の情報を収集する場合があります。</BodyText>
          <BodyText>・アカウント情報: Googleアカウントより提供されるユーザー名、メールアドレス、プロフィール画像</BodyText>
          <BodyText>・利用状況・端末情報: 識別子、OSの種類、クラッシュログ、パフォーマンスデータ</BodyText>
          <BodyText>・通信データ: 接続日時や通信品質等のログ（※通話内容自体は収集・保存されません） </BodyText>

          <HeadingText>2. 利用目的</HeadingText>
          <BodyText>収集した情報は、以下の目的で利用します。</BodyText>
          <BodyText>・本アプリの提供・維持およびユーザー認証のため</BodyText>
          <BodyText>・不具合の調査、アプリの品質向上のため</BodyText>
          <BodyText>・ユーザーからのお問い合わせに対応するため</BodyText>

          <HeadingText>3. 第三者提供・外部サービス</HeadingText>
          <BodyText>本アプリでは、以下の外部サービスを利用しており、各事業者に情報が提供される場合があります。</BodyText>
          <BodyText>・Google (Firebase): ユーザー認証、ログ収集、パフォーマンス監視</BodyText>
          <BodyText>・Agora.io: リアルタイム音声通信の提供</BodyText>
          <BodyText>・AWS: データのバックエンド処理および保存</BodyText>

          <HeadingText>4. 安全管理措置</HeadingText>
          <BodyText>当方は、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。</BodyText>

          <HeadingText>5. アカウントおよびデータの削除</HeadingText>
          <BodyText>本アプリからアカウントの削除が可能です。プロフィール画面の「退会する」ボタンから退会手続きを行うと、Firebase Authentication上のアカウント情報およびFirestore上のユーザーデータが削除されます。</BodyText>
          <BodyText>なお、退会後はアカウントの復元はできませんのでご注意ください。</BodyText>
          <BodyText>お問い合わせ先: mkapps.app@gmail.com</BodyText>

          <HeadingText>6. プライバシーポリシーの変更</HeadingText>
          <BodyText>当方は、法令変更への対応や本アプリの機能追加（広告の導入など）に伴い、必要に応じて本ポリシーを変更することがあります。重要な変更を行う場合は、本アプリ内または当方の指定する方法でユーザーに通知いたします。</BodyText>

          <Button
            mt={8}
            mb={10}
            onPress={() => {
              navigation.goBack();
            }}
          >
            戻る
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  )
}

export default PrivacyPolicyRecheckScreen