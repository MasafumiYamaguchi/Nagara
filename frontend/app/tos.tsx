import { Box, Button, Divider, ScrollView, Text, VStack, useColorMode } from 'native-base'
import { NativeStackScreenProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { RootStackParamList } from "./navigation/types";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, "ToS">;

const ToSScreen = ({navigation}: Props) => {
  const { colorMode: nativeBaseColorMode } = useColorMode();

  // 要件定義の「夜をイメージした落ち着いたトーン」に合わせたカラー設定 
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
      {/* ステータスバー付近の余白確保 */}
      <Box pt={12} bg={nativeBaseColorMode === 'light' ? 'coolGray.50' : 'coolGray.900'}/>
      
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <VStack space={2}>
          <Text fontSize="2xl" fontWeight="bold" color={headingColor} mb={4}>利用規約</Text>

          <BodyText>
            この規約（以下「本規約」）は、MKapps（以下「当方」）が提供するアプリケーション「Nagara」（以下「本アプリ」）の利用条件を定めるものです [cite: 1, 87]。ユーザーの皆様には、本規約に従って本アプリをご利用いただきます。
          </BodyText>

          <Divider bg={dividerColor} my={4} />

          <HeadingText>第1条（適用）</HeadingText>
          <BodyText>本規約は、ユーザーと当方との間の本アプリの利用に関わる一切の関係に適用されるものとします。</BodyText>
          <BodyText>ユーザーは、本アプリを利用した時点で、本規約の全ての記載内容に同意したものとみなされます。</BodyText>

          <HeadingText>第2条（利用環境・権利）</HeadingText>
          <BodyText>1. 本アプリを利用するために必要な通信機器、通信回線その他の環境は、ユーザーの責任と負担において準備するものとします [cite: 78]。</BodyText>
          <BodyText>2. 本アプリの提供にあたり、当方は第三者（Agora.io、Firebase等）のシステムを利用します [cite: 109, 113]。ユーザーはこれに同意し、当該第三者の利用規約についても遵守するものとします。</BodyText>
          <BodyText>3. 当方は、法令に基づき開示を求められた場合を除き、ユーザーの通話内容の傍受、録音、または保存を行わず、通信の秘密を厳守します 。</BodyText>

          <HeadingText>第3条（禁止事項）</HeadingText>
          <BodyText>ユーザーは、本アプリの利用にあたり、以下の行為を行ってはなりません。</BodyText>
          <BodyText>・法令または公序良俗に反する行為。</BodyText>
          <BodyText>・他のユーザーに対する誹謗中傷、脅迫、いやがらせ、またはハラスメント行為 [cite: 49]。</BodyText>
          <BodyText>・当方または第三者の著作権、肖像権その他の知的財産権を侵害する行為（権利者の許可なく音楽、音声等を配信する行為を含みます） [cite: 35]。</BodyText>
          <BodyText>・異性との出会いや交際、または不適切な接触を目的として本アプリを利用する行為 [cite: 13]。</BodyText>
          <BodyText>・相手方の同意なく通話内容を録音、録画、または公開する行為。</BodyText>
          <BodyText>・本アプリのサーバーへの過度な負荷をかける行為や、不正アクセス等の運営妨害行為。</BodyText>
          <BodyText>・その他、当方が不適切と判断する行為。</BodyText>

          <HeadingText>第4条（本アプリの提供の停止等）</HeadingText>
          <BodyText>当方は、システムの保守、天災、その他不可抗力により本アプリの提供が困難と判断した場合、ユーザーに事前に通知することなく本アプリの全部または一部の提供を停止または中断できるものとします。</BodyText>

          <HeadingText>第5条（免責事項）</HeadingText>
          <BodyText>1. 当方は、本アプリの欠陥、エラー、バグ、または権利侵害がないことを保証しません。</BodyText>
          <BodyText>2. 当方は、本アプリの利用に関してユーザーに生じた損害について、当方の故意または重過失による場合を除き、一切の責任を負いません。</BodyText>
          <BodyText>3. ユーザー間またはユーザーと第三者との間で生じた紛争については、ユーザーが自己の責任で解決するものとします。</BodyText>

          <HeadingText>第6条（サービス内容の変更等）</HeadingText>
          <BodyText>当方は、ユーザーに通知することなく本アプリの内容を変更し、または提供を中止することができるものとし、これによって生じた損害について一切の責任を負いません。</BodyText>

          <HeadingText>第7条（利用規約の変更）</HeadingText>
          <BodyText>当方は、いつでも本規約を変更できるものとします。変更後、本アプリを利用したユーザーは変更後の規約に同意したものとみなします。</BodyText>

          <HeadingText>第8条（反社会的勢力の排除）</HeadingText>
          <BodyText>1. ユーザーは、現在および将来にわたって、暴力団員等の反社会的勢力に該当しないこと、および自らまたは第三者を利用して暴力的な要求行為等を行わないことを表明し、保証するものとします。</BodyText>
          <BodyText>2. 当方は、ユーザーが前項に違反した場合、何ら通知することなく本アプリの利用停止、その他必要な措置を講じることができるものとします。</BodyText>

          <HeadingText>第9条（準拠法・裁判管轄）</HeadingText>
          <BodyText>本規約の解釈にあたっては日本法を準拠法とし、本アプリに関する紛争は当方の所在地を管轄する裁判所を専属的合意管轄とします。</BodyText>

          <Button
            mt={8}
            mb={10}
            onPress={async () => {
              await AsyncStorage.setItem('acceptedToS', 'true');
              navigation.replace("PrivacyPolicy");
            }}
          >
            同意して進む
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  )
}

export default ToSScreen