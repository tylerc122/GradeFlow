import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#f0f2f5",
      paper: "#ffffff",
    },
    primary: {
      main: "#2c3e50",
      light: "#34495e",
      dark: "#1a252f",
    },
    secondary: {
      main: "#16a085",
      light: "#1abc9c",
      dark: "#0e6655",
    },
    success: {
      main: "#27ae60",
      light: "#2ecc71",
      dark: "#219a52",
    },
    warning: {
      main: "#f39c12",
      light: "#f1c40f",
      dark: "#d35400",
    },
    error: {
      main: "#c0392b",
      light: "#e74c3c",
      dark: "#962d22",
    },
    text: {
      primary: "#2c3e50",
      secondary: "#7f8c8d",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(145deg, #f0f2f5 0%, #e8eaed 100%)",
          minHeight: "100vh",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          "&.MuiPaper-elevation1": {
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0px 2px 4px rgba(44, 62, 80, 0.05)",
          },
          "&.MuiPaper-elevation2": {
            background: "linear-gradient(145deg, #ffffff 0%, #f5f6f7 100%)",
            boxShadow: "0px 4px 8px rgba(44, 62, 80, 0.08)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: "8px",
        },
        contained: {
          boxShadow: "none",
          background: "linear-gradient(145deg, #2c3e50 0%, #34495e 100%)",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(44, 62, 80, 0.15)",
            background: "linear-gradient(145deg, #34495e 0%, #2c3e50 100%)",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
