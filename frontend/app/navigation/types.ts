export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  ToS: undefined;
  Main: undefined; // BottomTabNavigatorを指す
  Register: undefined;
  Privacy: undefined;
  Room: { roomId: string, name: string, nop: number, password: string }; // ルームIDをパラメータとして受け取る
  HelpAndSupport: undefined; // ヘルプ・サポート画面
  Support: undefined; // お問い合わせ・不具合報告画面
};
