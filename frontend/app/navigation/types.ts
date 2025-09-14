export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Main: undefined; // BottomTabNavigatorを指す
  Register: undefined;
  Room: { roomId: string, name: string, nop: number }; // ルームIDをパラメータとして受け取る
};
