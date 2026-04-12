import { createContext } from "react";

export const ColorModeContext = createContext<{
    colorMode: "light" | "dark";
    toggleColorMode: () => void;
    setColorMode: (mode: "light" | "dark") => void;
}>({
    colorMode: "light",
    toggleColorMode: () => {},
    setColorMode: () => {},
});