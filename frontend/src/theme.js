import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    primary: {
      // Medium-vibrant indigo blue (from your example)
      main: "#5361c9", // Slightly adjusted to match your image
      light: "#7581d6",
      dark: "#3f51b5",
      contrastText: "#ffffff",
    },
    secondary: {
      // Vibrant teal that complements the indigo
      main: "#009688",
      light: "#26a69a",
      dark: "#00796b",
      contrastText: "#ffffff",
    },
    success: {
      main: "#4caf50",
      light: "#66bb6a",
      dark: "#388e3c",
    },
    warning: {
      main: "#ff9800",
      light: "#ffb74d",
      dark: "#f57c00",
    },
    error: {
      main: "#f44336",
      light: "#ef5350",
      dark: "#d32f2f",
    },
    text: {
      primary: "#263238",
      secondary: "#546e7a",
    },
    divider: "rgba(0, 0, 0, 0.08)",
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.015em",
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.01em",
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 2px 6px rgba(0, 0, 0, 0.04)",
    "0px 4px 12px rgba(0, 0, 0, 0.05)",
    "0px 6px 16px rgba(0, 0, 0, 0.06)",
    "0px 8px 24px rgba(0, 0, 0, 0.07)",
    "0px 10px 28px rgba(0, 0, 0, 0.09)",
    ...Array(19).fill("none"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
          minHeight: "100vh",
          scrollBehavior: "smooth",
        },
        ":root": {
          "--gradient-primary":
            "linear-gradient(90deg, #5361c9 0%, #7581d6 100%)",
          "--gradient-secondary":
            "linear-gradient(90deg, #009688 0%, #26a69a 100%)",
        },
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "#f1f5f9",
          borderRadius: "8px",
        },
        "*::-webkit-scrollbar-thumb": {
          background: "#c5cae9",
          borderRadius: "8px",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: "#9fa8da",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          "&.MuiPaper-elevation1": {
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.04)",
          },
          "&.MuiPaper-elevation2": {
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700, // Increased font weight for better visibility
          padding: "10px 24px", // Slightly larger padding
          borderRadius: "10px",
          transition: "all 0.2s ease-in-out",
          letterSpacing: "0.01em",
          fontSize: "1rem", // Slightly larger font size
          "&:hover": {
            transform: "translateY(-2px)",
          },
        },
        contained: {
          boxShadow: "0px 4px 12px rgba(63, 81, 181, 0.15)",
          "&:hover": {
            boxShadow: "0px 6px 16px rgba(63, 81, 181, 0.25)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(90deg, #5361c9 0%, #7581d6 100%)",
          color: "#ffffff", // Ensuring white text for better contrast
          "&:hover": {
            background: "linear-gradient(90deg, #3f51b5 0%, #5361c9 100%)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(90deg, #009688 0%, #26a69a 100%)",
          color: "#ffffff", // Ensuring white text for better contrast
          "&:hover": {
            background: "linear-gradient(90deg, #00796b 0%, #009688 100%)",
          },
        },
        outlined: {
          borderWidth: "2px", // Thicker border for better visibility
          "&:hover": {
            borderWidth: "2px",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: "rgba(83, 97, 201, 0.08)", // Light background on hover for text buttons
          },
        },
        // Adding specific styling for buttons on dark backgrounds
        containedInherit: {
          backgroundColor: "#ffffff", // White background
          color: "#5361c9", // Primary color text
          "&:hover": {
            backgroundColor: "#f5f5f5", // Slight gray on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          overflow: "hidden",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.07)",
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": {
            paddingBottom: "24px",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            transition:
              "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&.Mui-focused": {
              boxShadow: "0 0 0 2px rgba(83, 97, 201, 0.1)",
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          padding: "12px 16px",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          height: "8px",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 500,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.04)",
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          minWidth: "unset",
          padding: "12px 16px",
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          padding: "24px 0",
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          "&.Mui-active": {
            fontWeight: 600,
          },
          "&.Mui-completed": {
            fontWeight: 600,
          },
        },
      },
    },
  },
});

export default theme;
