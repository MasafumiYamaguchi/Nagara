import { registerRootComponent } from 'expo';
import RootLayout from './app/_layout';

export default function App() {
  return <RootLayout />;
}

registerRootComponent(App);