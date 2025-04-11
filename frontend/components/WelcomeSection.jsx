/**
 * This component is the welcome section of the Calculator page.
 * Shows a tutorial guide and how it works. Able to review tutorial again after closing.
 */
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Stack,
  useTheme as useMuiTheme,
  alpha,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Copy, Calculator, BarChart2, Award, Sparkles, HelpCircle } from "lucide-react";
import { useTheme } from "../src/contexts/ThemeContext";
import TutorialDialog from "./dialogs/TutorialDialog";
import { useUserPreferences } from "../src/contexts/UserPreferencesContext";

const WelcomeSection = () => {
  const theme = useMuiTheme();
  const { mode, isDark } = useTheme();
  const { hasSeenTutorial, markTutorialAsSeen } = useUserPreferences();
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial automatically on first visit
  useEffect(() => {
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [hasSeenTutorial]);

  // Handle tutorial dialog close
  const handleTutorialClose = () => {
    setShowTutorial(false);
    markTutorialAsSeen();
  };

  // Handle manual tutorial open
  const handleOpenTutorial = () => {
    setShowTutorial(true);
  };

  // The steps in the grade calculation process
  const steps = [
    {
      icon: <Award size={20} />,
      title: "Set up your grade categories and weights",
      color: theme.palette.primary.main,
    },
    {
      icon: <Copy size={20} />,
      title: "Copy and paste your grades from Blackboard",
      color: theme.palette.secondary.main,
    },
    {
      icon: <BarChart2 size={20} />,
      title: "Our system automatically categorizes assignments",
      color: theme.palette.success.main,
    },
    {
      icon: <Calculator size={20} />,
      title: "Get instant calculations and grade predictions",
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Stack spacing={4}>
      {/* Tutorial Dialog */}
      <TutorialDialog open={showTutorial} onClose={handleTutorialClose} />
      
      {/* Welcome Message */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: "20px",
          background: isDark ? "#1e1e1e" : "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Remove decorative corner effect */}

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "14px",
                background: "var(--gradient-primary)",
              }}
            >
              <Sparkles size={24} color="white" />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: "1.8rem",
              }}
            >
              Welcome to GradeFlow
            </Typography>
          </Box>

          <Chip
            label="Instant Grade Calculation"
            size="small"
            sx={{
              fontWeight: 500,
              backgroundColor: isDark 
                ? "transparent" 
                : alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              borderRadius: "6px",
              mb: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.5 : 0.2)}`,
            }}
          />

          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "1.1rem",
              lineHeight: 1.5,
            }}
          >
            Calculate your grades instantly by pasting directly from Blackboard.
            Our advanced algorithm automatically categorizes your assignments
            and provides accurate calculations.
          </Typography>
        </Box>
      </Paper>

      {/* How It Works */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: "20px",
          bgcolor: isDark ? "#1e1e1e" : "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Remove decorative corner effect */}

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            mb: 3
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  background: alpha(theme.palette.secondary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.palette.secondary.main,
                }}
              >
                <Award size={18} />
              </Box>
              How It Works
            </Typography>
            
            {/* Question mark icon to open tutorial */}
            <Tooltip title="Open Tutorial Guide">
              <IconButton
                onClick={handleOpenTutorial}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <HelpCircle size={20} />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack spacing={3}>
            {steps.map((step, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  padding: 2,
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: alpha(step.color, 0.2),
                  backgroundColor: alpha(step.color, 0.03),
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateX(8px)",
                    boxShadow: `0 4px 12px ${alpha(step.color, 0.1)}`,
                    backgroundColor: alpha(step.color, 0.06),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    backgroundColor: alpha(step.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step.color,
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </Box>
                <Typography
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {step.title}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Paper>

      {/* Sample Format */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: "20px",
          bgcolor: isDark ? "#1e1e1e" : "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: theme.palette.text.primary,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              background: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.main,
            }}
          >
            <Copy size={18} />
          </Box>
          Sample Format
        </Typography>

        <Box
          sx={{
            p: 3,
            bgcolor: isDark ? "#252525" : theme.palette.grey[50],
            borderRadius: "12px",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            whiteSpace: "pre-wrap",
            border: `1px solid ${alpha(
              theme.palette.primary.main,
              isDark ? 0.2 : 0.1
            )}`,
            position: "relative",
            color: isDark ? "rgba(255, 255, 255, 0.9)" : "inherit",
            "&:after": {
              content: "'Copy directly from Blackboard'",
              position: "absolute",
              top: 0,
              right: 0,
              backgroundColor: theme.palette.primary.main,
              color: "white",
              fontSize: "0.7rem",
              padding: "4px 8px",
              borderRadius: "0 12px 0 8px",
            },
          }}
        >
          {`Quiz 1\nTest\n\nSep 11, 2024 6:13 PM\nGRADED\n14.00\n/14`}
        </Box>
      </Paper>
    </Stack>
  );
};

export default WelcomeSection;
