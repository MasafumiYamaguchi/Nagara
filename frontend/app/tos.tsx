import { Box, Button, Divider, ScrollView, Text, VStack } from 'native-base'
import { NativeStackScreenProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { RootStackParamList } from "./navigation/types";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, "ToS">;

const ToSScreen = ({navigation}: Props) => {
  return (
    <Box flex={1} mt={8} mb={8}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <VStack space={4}>
          <Text fontSize="2xl" fontWeight="bold">利用規約</Text>

          <Text>
            この規約（以下「本規約」）は、MKapps（以下「当方」）が提供するアプリケーション
            「Nagara」（以下「本アプリ」）の利用条件を定めるものです。ユーザーの皆様には、
            本規約に従って本アプリをご利用いただきます。
          </Text>

          <Divider />

          <Text fontSize="lg" fontWeight="bold">第1条（適用）</Text>
          <Text>本規約は、ユーザーと当方との間の本アプリの利用に関わる一切の関係に適用されるものとします。</Text>
          <Text>ユーザーは、本アプリをダウンロードし、利用を開始した時点で、本規約の全ての記載内容に同意したものとみなされます。</Text>

          <Text fontSize="lg" fontWeight="bold">第2条（利用環境・権利）</Text>
          <Text>本アプリを利用するために必要なスマートフォン、通信機器、通信回線その他の環境は、ユーザーの責任と負担において準備するものとします。</Text>
          <Text>本アプリの提供にあたり、当方は第三者（Agora.io、Firebase等）のシステムを利用する場合があります。ユーザーはこれに同意し、当該第三者の利用規約についても遵守するものとします。</Text>
          <Text>本アプリを通じて提供される音声通話機能について、当方は通話内容の録音または保存を行いません。</Text>

          <Text fontSize="lg" fontWeight="bold">第3条（禁止事項）</Text>
          <Text>ユーザーは、本アプリの利用にあたり、以下の行為を行ってはなりません。</Text>
          <Text>・法令または公序良俗に反する行為。</Text>
          <Text>・他のユーザーに対する誹謗中傷、脅迫、いやがらせ、またはハラスメント行為。</Text>
          <Text>・相手方の同意なく通話内容を録音、録画、または公開する行為。</Text>
          <Text>・本アプリのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為。</Text>
          <Text>・当方のサービスの運営を妨害するおそれのある行為。</Text>
          <Text>・その他、当方が不適切と判断する行為。</Text>

          <Text fontSize="lg" fontWeight="bold">第4条（本アプリの提供の停止等）</Text>
          <Text>当方は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本アプリの全部または一部の提供を停止または中断することができるものとします。</Text>
          <Text>・本アプリに係るシステムの保守点検または更新を行う場合。</Text>
          <Text>・地震、落雷、火災、停電または天災などの不可抗力により、本アプリの提供が困難となった場合。</Text>
          <Text>・その他、当方が本アプリの提供が困難と判断した場合。</Text>

          <Text fontSize="lg" fontWeight="bold">第5条（免責事項）</Text>
          <Text>当方は、本アプリに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを明示的にも黙示的にも保証しておりません。</Text>
          <Text>当方は、本アプリの利用に関してユーザーに生じたあらゆる損害について、当方の故意または重過失による場合を除き、一切の責任を負いません。</Text>
          <Text>本アプリの利用に関連して、ユーザーと他のユーザーまたは第三者との間において生じた紛争等については、ユーザーが自己の責任によって解決するものとし、当方は一切責任を負いません。</Text>

          <Text fontSize="lg" fontWeight="bold">第6条（サービス内容の変更等）</Text>
          <Text>当方は、ユーザーに通知することなく、本アプリの内容を変更しまたは本アプリの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。</Text>

          <Text fontSize="lg" fontWeight="bold">第7条（利用規約の変更）</Text>
          <Text>当方は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本アプリの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。</Text>

          <Text fontSize="lg" fontWeight="bold">第8条（準拠法・裁判管轄）</Text>
          <Text>本規約の解釈にあたっては、日本法を準拠法とします。</Text>
          <Text>本アプリに関して紛争が生じた場合には、当方の所在地を管轄する裁判所を専属的合意管轄とします。</Text>

          <Button
            onPress={async () => {
              await AsyncStorage.setItem('acceptedToS', 'true');
              navigation.replace('Main');
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