import { registerRootComponent } from "expo";
import { useEffect, useRef } from "react";
import perf from "@react-native-firebase/perf";

import RootLayout from "./app/_layout";

export default function App() {
  const traceRef = useRef(null);

  useEffect(() => {
    const startTrace = async () => {
      const trace = await perf().startTrace("app_startup_trace");
      trace.putAttribute("platform", "expo");
      traceRef.current = trace;
    };

    startTrace();

    return () => {
      if (traceRef.current) {
        traceRef.current.stop();
      }
    };
  }, []);
  return <RootLayout />;
}

registerRootComponent(App);
