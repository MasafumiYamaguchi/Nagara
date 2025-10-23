import { createContext } from "react";

export const ColorModeContext = createContext<{
    colorMode: "light" | "dark";
    toggleColorMode: () => void;
}>({
    colorMode: "light",
    toggleColorMode: () => {},
});