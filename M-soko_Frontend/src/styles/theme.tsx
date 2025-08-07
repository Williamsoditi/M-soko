import { createTheme } from "@mui/material/styles";

// A centralized color palette
const sharedPalette = {
  primary: {
    main: "#5C6BC0",
    light: "#8e99f3",
    dark: "#26418f",
    contrastText: "#fff",
  },
  secondary: {
    main: "#ff9800",
    light: "#ffc947",
    dark: "#c66900",
    contrastText: "#000",
  },
  background: {
    default: "#F4F6F8",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#1A2027",
    secondary: "#4A5568",
  },
};

// MUI Theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: sharedPalette.primary.main,
      light: sharedPalette.primary.light,
      dark: sharedPalette.primary.dark,
      contrastText: sharedPalette.primary.contrastText,
    },
    secondary: {
      main: sharedPalette.secondary.main,
      light: sharedPalette.secondary.light,
      dark: sharedPalette.secondary.dark,
      contrastText: sharedPalette.secondary.contrastText,
    },
    background: {
      default: sharedPalette.background.default,
      paper: sharedPalette.background.paper,
    },
    text: {
      primary: sharedPalette.text.primary,
      secondary: sharedPalette.text.secondary,
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

export { muiTheme };