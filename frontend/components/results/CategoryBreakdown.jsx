/**
 * Another component of the results screen that shows the user their categories and the grades specific to each category.
 * Can add hypothetical assignments to a category from here.
 */
import React from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Plus,
  Layers,
  AlertCircle,
  Clock,
  CheckCircle,
  BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";

export const CategoryBreakdown = ({
  categories,
  whatIfMode,
  hypotheticalAssignments,
  calculateCategoryGrade,
  upcomingByCategory,
  setSelectedCategory,
  setDialogOpen,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Get color based on grade
  const getGradeColor = (grade) => {
    if (grade >= 90) return theme.palette.success.main;
    if (grade >= 80) return theme.palette.primary.main;
    if (grade >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get proper icon for grade
  const getGradeIcon = (grade) => {
    if (grade >= 90) return <CheckCircle size={16} />;
    if (grade >= 80) return <BarChart2 size={16} />;
    if (grade >= 70) return <AlertCircle size={16} />;
    return <AlertCircle size={16} />;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: "20px",
        backgroundColor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative element */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: alpha(theme.palette.primary.main),
          zIndex: 0,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                backgroundColor: isDark 
                  ? "transparent"
                  : alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.palette.primary.main,
                border: isDark
                  ? `1px solid ${alpha(theme.palette.primary.main, 0.5)}`
                  : "none",
              }}
            >
              <Layers size={22} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Grade Breakdown by Category
            </Typography>
          </Box>
        </Box>

        <Stack spacing={2.5}>
          {categories.map((category, index) => {
            const categoryHypotheticals = hypotheticalAssignments.filter(
              (a) => a.categoryName === category.name
            );

            const allAssignments = [
              ...(category.assignments || []),
              ...(categoryHypotheticals || []),
            ];

            const categoryGrade = calculateCategoryGrade(
              allAssignments,
              category.name
            );
            const weightedContribution =
              categoryGrade * (category.weight / 100);
            const hasUpcoming = upcomingByCategory[category.name] > 0;
            const gradeColor = getGradeColor(categoryGrade);

            return (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: alpha(gradeColor, 0.2),
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 20px ${alpha(gradeColor)}`,
                      "& .add-button": {
                        opacity: 1,
                        transform: "translateX(0)",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "10px",
                            backgroundColor: isDark 
                              ? "transparent"
                              : alpha(gradeColor, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: gradeColor,
                            border: isDark
                              ? `1px solid ${alpha(gradeColor, 0.5)}`
                              : "none",
                          }}
                        >
                          {getGradeIcon(categoryGrade)}
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {category.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ ml: "46px" }}
                      >
                        Weight: <b>{category.weight}%</b> • Contribution:{" "}
                        <b>{weightedContribution.toFixed(2)}%</b>
                      </Typography>
                    </Box>

                    {whatIfMode && (
                      <Button
                        className="add-button"
                        size="small"
                        variant="outlined"
                        startIcon={<Plus size={16} />}
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setDialogOpen(true);
                        }}
                        sx={{
                          borderRadius: "10px",
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          color: theme.palette.primary.main,
                          opacity: { xs: 1, md: 0.4 },
                          transform: {
                            xs: "translateX(0)",
                            md: "translateX(10px)",
                          },
                          transition: "opacity 0.2s ease, transform 0.2s ease",
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.04
                            ),
                          },
                        }}
                      >
                        Add Hypothetical
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ mb: 2.5, mt: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Tooltip
                        title={`${categoryGrade.toFixed(
                          2
                        )}% grade in this category`}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: gradeColor,
                            fontWeight: 600,
                            borderRadius: "8px",
                            px: 1.5,
                            py: 0.5,
                            backgroundColor: isDark 
                              ? "transparent"
                              : alpha(gradeColor, 0.08),
                            border: isDark
                              ? `1px solid ${alpha(gradeColor, 0.5)}`
                              : "none",
                          }}
                        >
                          {getGradeIcon(categoryGrade)}
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: gradeColor }}
                          >
                            {categoryGrade.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(categoryGrade, 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: alpha(gradeColor, 0.1),
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: gradeColor,
                          borderRadius: 5,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Badge
                        badgeContent={allAssignments.length}
                        color="primary"
                        sx={{
                          "& .MuiBadge-badge": {
                            right: -5,
                            top: 5,
                            border: `2px solid ${theme.palette.background.paper}`,
                            padding: "0 4px",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            height: 30,
                            minWidth: 30,
                            borderRadius: "8px",
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08
                            ),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.palette.primary.main,
                            px: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                          >
                            Assignments
                          </Typography>
                        </Box>
                      </Badge>
                    </Box>

                    {hasUpcoming && (
                      <Tooltip
                        title={`${
                          upcomingByCategory[category.name]
                        } upcoming assignments`}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: theme.palette.warning.main,
                            borderRadius: "8px",
                            px: 1.5,
                            py: 0.5,
                            backgroundColor: alpha(
                              theme.palette.warning.main,
                              0.08
                            ),
                          }}
                        >
                          <Clock size={14} />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.warning.main,
                            }}
                          >
                            {upcomingByCategory[category.name]} upcoming
                          </Typography>
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </Paper>
              </motion.div>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
};

export default CategoryBreakdown;
