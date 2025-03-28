import { createTheme } from "@mui/material/styles";

// Create a function to generate theme based on mode
const createAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // Light theme
            background: {
              default: "#f8fafc",
              paper: "#ffffff",
            },
            primary: {
              main: "#5361c9",
              light: "#7581d6",
              dark: "#3f51b5",
              contrastText: "#ffffff",
            },
            secondary: {
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
          }
        : {
            // Dark theme
            background: {
              default: "#121212",
              paper: "#1e1e1e",
              alt: "#252525", // Secondary dark background for alternating elements
            },
            primary: {
              main: "#7581d6",
              light: "#9fa8da",
              dark: "#5361c9",
              contrastText: "#ffffff",
            },
            secondary: {
              main: "#26a69a",
              light: "#4db6ac",
              dark: "#00897b",
              contrastText: "#ffffff",
            },
            success: {
              main: "#66bb6a",
              light: "#81c784",
              dark: "#4caf50",
            },
            warning: {
              main: "#ffb74d",
              light: "#ffc77d",
              dark: "#ff9800",
            },
            error: {
              main: "#ef5350",
              light: "#f44336",
              dark: "#d32f2f",
            },
            text: {
              primary: "#e0e0e0",
              secondary: "#aaaaaa",
            },
            divider: "rgba(255, 255, 255, 0.12)",
          }),
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
            background:
              mode === "light"
                ? "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)"
                : "linear-gradient(145deg, #121212 0%, #1a1a1a 100%)",
            minHeight: "100vh",
            scrollBehavior: "smooth",
          },
          ":root": {
            "--gradient-primary":
              mode === "light"
                ? "linear-gradient(90deg, #5361c9 0%, #7581d6 100%)"
                : "linear-gradient(90deg, #7581d6 0%, #9fa8da 100%)",
            "--gradient-secondary":
              mode === "light"
                ? "linear-gradient(90deg, #009688 0%, #26a69a 100%)"
                : "linear-gradient(90deg, #26a69a 0%, #4db6ac 100%)",
          },
          "*::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "*::-webkit-scrollbar-track": {
            background: mode === "light" ? "#f1f5f9" : "#2c2c2c",
            borderRadius: "8px",
          },
          "*::-webkit-scrollbar-thumb": {
            background: mode === "light" ? "#c5cae9" : "#555555",
            borderRadius: "8px",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            background: mode === "light" ? "#9fa8da" : "#777777",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow:
              mode === "light"
                ? "0px 2px 6px rgba(0, 0, 0, 0.04)"
                : "0px 2px 6px rgba(0, 0, 0, 0.2)",
            border:
              mode === "light"
                ? "1px solid rgba(0, 0, 0, 0.06)"
                : "1px solid rgba(255, 255, 255, 0.06)",
            "&.MuiPaper-elevation1": {
              boxShadow:
                mode === "light"
                  ? "0px 2px 6px rgba(0, 0, 0, 0.04)"
                  : "0px 2px 6px rgba(0, 0, 0, 0.2)",
            },
            "&.MuiPaper-elevation2": {
              boxShadow:
                mode === "light"
                  ? "0px 4px 12px rgba(0, 0, 0, 0.05)"
                  : "0px 4px 12px rgba(0, 0, 0, 0.25)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 700,
            padding: "10px 24px",
            borderRadius: "10px",
            transition: "all 0.2s ease-in-out",
            letterSpacing: "0.01em",
            fontSize: "1rem",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
              pointerEvents: "none",
            },
            "&:hover": {
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            },
          },
          contained: {
            boxShadow:
              mode === "light"
                ? "0px 4px 12px rgba(63, 81, 181, 0.15)"
                : "0px 4px 12px rgba(0, 0, 0, 0.25)",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0px 6px 16px rgba(63, 81, 181, 0.25)"
                  : "0px 6px 16px rgba(0, 0, 0, 0.35)",
            },
          },
          containedPrimary: {
            background: "var(--gradient-primary)",
            color: "#ffffff",
            "&:hover": {
              background:
                mode === "light"
                  ? "linear-gradient(90deg, #3f51b5 0%, #5361c9 100%)"
                  : "linear-gradient(90deg, #5361c9 0%, #7581d6 100%)",
            },
          },
          containedSecondary: {
            background: "var(--gradient-secondary)",
            color: "#ffffff",
            "&:hover": {
              background:
                mode === "light"
                  ? "linear-gradient(90deg, #00796b 0%, #009688 100%)"
                  : "linear-gradient(90deg, #00897b 0%, #26a69a 100%)",
            },
          },
          outlined: {
            borderWidth: "2px",
            "&:hover": {
              borderWidth: "2px",
            },
          },
          text: {
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(83, 97, 201, 0.08)"
                  : "rgba(117, 129, 214, 0.08)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            overflow: "hidden",
            transition:
              "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow:
                mode === "light"
                  ? "0px 8px 24px rgba(0, 0, 0, 0.07)"
                  : "0px 8px 24px rgba(0, 0, 0, 0.3)",
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
              backgroundColor: mode === "light" ? "#ffffff" : "#252525",
              transition:
                "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out",
              "&.Mui-focused": {
                boxShadow:
                  mode === "light"
                    ? "0 0 0 2px rgba(83, 97, 201, 0.1)"
                    : "0 0 0 2px rgba(117, 129, 214, 0.2)",
              },
              "& fieldset": {
                borderColor:
                  mode === "light"
                    ? "rgba(0, 0, 0, 0.23)"
                    : "rgba(255, 255, 255, 0.23)",
              },
              "&:hover fieldset": {
                borderColor:
                  mode === "light"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(255, 255, 255, 0.4)",
              },
            },
            "& .MuiInputBase-input": {
              color: mode === "light" ? "#263238" : "rgba(255, 255, 255, 0.9)",
            },
            "& .MuiInputLabel-root": {
              color: mode === "light" ? "#546e7a" : "rgba(255, 255, 255, 0.7)",
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
            backgroundColor:
              mode === "light"
                ? "rgba(255, 255, 255, 0.9)"
                : "rgba(18, 18, 18, 0.9)",
            backdropFilter: "blur(8px)",
            boxShadow:
              mode === "light"
                ? "0px 2px 6px rgba(0, 0, 0, 0.04)"
                : "0px 2px 6px rgba(0, 0, 0, 0.2)",
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
            boxShadow:
              mode === "light"
                ? "0px 2px 6px rgba(0, 0, 0, 0.04)"
                : "0px 2px 6px rgba(0, 0, 0, 0.2)",
            "&:before": {
              display: "none",
            },
            "&.Mui-expanded": {
              boxShadow:
                mode === "light"
                  ? "0px 4px 12px rgba(0, 0, 0, 0.05)"
                  : "0px 4px 12px rgba(0, 0, 0, 0.25)",
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

export default createAppTheme;
