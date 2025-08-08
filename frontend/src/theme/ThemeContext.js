import React, { createContext, useState, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { baselightTheme } from "./DefaultColors";
import typography from "./Typography";
import { shadows } from "./Shadows";

const lightPalette = baselightTheme; // Use your custom Light theme
const darkPalette = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: '#4570EA',
    },
    secondary: {
      main: "#23afdb",
    },
    background: {
      default: "#121212",
      paper: "#242424",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B0BEC5",
    },
    success: {
      main: '#02b3a9',
      contrastText: '#ffffff',
    },
    info: {
      main: '#1682d4',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f3704d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ae8e59',
      contrastText: '#ffffff',
    },
  },
  typography,
  shadows
});

export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("light"); // Default to light mode

  const toggleTheme = () => {
    // setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
  
      // Update body class according to the new mode
      if (newMode === "dark") {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
      } else {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
      }
  
      return newMode; // Return the updated mode
    });
  };

  // const theme = useMemo(
  //   () =>
  //     createTheme({
  //       palette: {
  //         mode: mode,
  //       },
  //     }),
  //   [mode]
  // );

  const theme = useMemo(
    () => (mode === "light" ? lightPalette : darkPalette),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};