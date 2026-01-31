export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Main: undefined; // BottomTabNavigatorを指す
  Register: undefined;
  Privacy: undefined;
  Room: { roomId: string, name: string, nop: number, password: string }; // ルームIDをパラメータとして受け取る
};
