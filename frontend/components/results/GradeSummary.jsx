import React from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Stack,
  alpha,
  Tooltip,
  Chip,
  useTheme as useMuiTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calculator,
  Award,
  Target,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { useTheme } from "../../src/contexts/ThemeContext";
import { percentageToLetter } from "../../src/utils/letterGradeUtils";

export const GradeSummary = ({
  finalGrade,
  whatIfMode,
  setWhatIfMode,
  targetGrade,
  setTargetGrade,
}) => {
  const theme = useMuiTheme();
  const { mode, isDark } = useTheme();

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return theme.palette.success.main;
    if (percentage >= 80) return theme.palette.primary.main;
    if (percentage >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getGradeIcon = (percentage) => {
    if (percentage >= 90) return <CheckCircle size={28} />;
    if (percentage >= 80) return <Award size={28} />;
    if (percentage >= 70) return <Target size={28} />;
    return <Target size={28} />;
  };

  // Calculate GPA if there are letter grades
  const gpa = finalGrade.hasLetterGrades ? finalGrade.percentage : null;

  // Get letter grade from percentage
  const letterGrade = finalGrade.hasLetterGrades
    ? percentageToLetter(finalGrade.percentage * 25)
    : percentageToLetter(finalGrade.percentage);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: "20px",
        background: isDark
          ? "linear-gradient(135deg, #1e1e1e 0%, #252525 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "30%",
          height: "100%",
          background: `linear-gradient(135deg, ${alpha(
            getGradeColor(finalGrade.percentage),
            0
          )} 0%, ${alpha(getGradeColor(finalGrade.percentage))} 100%)`,
          zIndex: 0,
        }}
      />

      <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={{
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Award size={20} color={getGradeColor(finalGrade.percentage)} />
              Current Grade
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                position: "relative",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 90,
                    height: 90,
                    borderRadius: "24px",
                    background: `linear-gradient(135deg, ${getGradeColor(
                      finalGrade.percentage
                    )} 0%, ${alpha(
                      getGradeColor(finalGrade.percentage),
                      0.8
                    )} 100%)`,
                    boxShadow: `0 8px 16px ${alpha(
                      getGradeColor(finalGrade.percentage),
                      isDark ? 0.3 : 0.2
                    )}`,
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "1.8rem",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      fontSize: "2rem",
                      lineHeight: 1,
                      color: "#ffffff",
                    }}
                  >
                    {Math.floor(finalGrade.percentage)}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      lineHeight: 1,
                      color: "#ffffff",
                    }}
                  >
                    {(finalGrade.percentage % 1).toFixed(2).substring(1)}%
                  </Typography>
                </Box>
              </motion.div>

              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: getGradeColor(finalGrade.percentage),
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {letterGrade}
                  <Tooltip title="View grade details">
                    <ArrowUpRight
                      size={20}
                      style={{ cursor: "pointer", opacity: 0.6 }}
                      onClick={() => alert("Grade details coming soon!")}
                    />
                  </Tooltip>
                </Typography>

                {gpa !== null && (
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 500,
                      color: "text.secondary",
                    }}
                  >
                    {gpa.toFixed(2)} GPA
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={whatIfMode ? <Zap /> : <Calculator />}
            onClick={() => setWhatIfMode(!whatIfMode)}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: "14px",
              backgroundColor: whatIfMode
                ? theme.palette.error.main
                : theme.palette.primary.main,
              backgroundImage: whatIfMode
                ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: whatIfMode
                ? `0 8px 16px ${alpha(theme.palette.error.main)}`
                : `0 8px 16px ${alpha(theme.palette.primary.main)}`,
              "&:hover": {
                backgroundColor: whatIfMode
                  ? theme.palette.error.dark
                  : theme.palette.primary.dark,
                transform: "translateY(-2px)",
                boxShadow: whatIfMode
                  ? `0 10px 20px ${alpha(theme.palette.error.main, 0.3)}`
                  : `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {whatIfMode ? "Exit What-If Mode" : "Enter What-If Mode"}
          </Button>
        </Box>

        {whatIfMode && (
          <Box
            sx={{
              p: 3,
              bgcolor: isDark
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.primary.main, 0.04),
              borderRadius: "16px",
              border: `1px solid ${alpha(
                theme.palette.primary.main,
                isDark ? 0.2 : 0.1
              )}`,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Target size={20} color={theme.palette.primary.main} />
              <Typography
                variant="h6"
                sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
              >
                What-If Analysis
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <TextField
                label="Target Grade"
                type="number"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Typography color="text.secondary">%</Typography>
                  ),
                  sx: {
                    borderRadius: "12px",
                    backgroundColor: isDark ? "#252525" : "#ffffff",
                  },
                }}
                sx={{
                  width: { xs: "100%", sm: 150 },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transition: "all 0.2s ease",
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 3px ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    },
                  },
                }}
              />

              <Tooltip title="Calculate needed scores to achieve target">
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    px: 3,
                    py: 1.2,
                    borderWidth: "2px",
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    backgroundColor: isDark ? "#252525" : "transparent",
                    "&:hover": {
                      borderWidth: "2px",
                      backgroundColor: isDark
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.primary.main, 0.03),
                    },
                  }}
                >
                  Calculate Needed Scores
                </Button>
              </Tooltip>

              {targetGrade && (
                <Chip
                  label={`Goal: ${targetGrade}%`}
                  size="medium"
                  icon={<Target size={16} />}
                  sx={{
                    ml: "auto",
                    fontWeight: 500,
                    backgroundColor: alpha(
                      theme.palette.secondary.main,
                      isDark ? 0.2 : 0.1
                    ),
                    color: theme.palette.secondary.main,
                    borderRadius: "8px",
                    "& .MuiChip-icon": {
                      color: theme.palette.secondary.main,
                    },
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default GradeSummary;
