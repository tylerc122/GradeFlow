import React from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  alpha,
  useTheme as useMuiTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { School, Computer, Edit, Clock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../src/contexts/ThemeContext";
import { useGPA } from "../src/contexts/GPAContext";

const GPAInfoCard = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { isDark } = useTheme();
  const { centralGPA, editGPA, hiddenGPAs, toggleOverallGPA, toggleMajorGPA } = useGPA();

  const formatDate = (dateString) => {
    if (!dateString) return "Never updated";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditGPA = () => {
    editGPA();
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: isDark
          ? "linear-gradient(145deg, #1e1e1e 0%, #252525 100%)"
          : "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <School
          size={32}
          color={muiTheme.palette.primary.main}
          opacity={0.8}
        />
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Your Current GPA
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {centralGPA.name || "My GPA"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
            <Clock size={16} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {formatDate(centralGPA.lastUpdated)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          {/* Overall GPA Card */}
          <Box
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: "45%" },
              p: 3,
              borderRadius: 2,
              backgroundColor: alpha(
                muiTheme.palette.success.main,
                isDark ? 0.15 : 0.08
              ),
              border: "1px solid",
              borderColor: alpha(
                muiTheme.palette.success.main,
                isDark ? 0.3 : 0.2
              ),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <School size={20} color={muiTheme.palette.success.main} />
                <Typography
                  variant="subtitle1"
                  sx={{ ml: 1, fontWeight: 600, color: "text.secondary" }}
                >
                  Overall GPA
                </Typography>
              </Box>
              <Tooltip title={hiddenGPAs.overall ? "Show GPA" : "Hide GPA"}>
                <IconButton 
                  onClick={toggleOverallGPA} 
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      hiddenGPAs.overall
                        ? muiTheme.palette.warning.main
                        : muiTheme.palette.success.main,
                      0.15
                    ),
                    color: hiddenGPAs.overall
                      ? muiTheme.palette.warning.main
                      : muiTheme.palette.success.main,
                    "&:hover": {
                      backgroundColor: alpha(
                        hiddenGPAs.overall
                          ? muiTheme.palette.warning.main
                          : muiTheme.palette.success.main,
                        0.25
                      ),
                    },
                  }}
                >
                  {hiddenGPAs.overall ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              </Tooltip>
            </Box>
            {!hiddenGPAs.overall ? (
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "success.main",
                }}
              >
                {centralGPA.overallGPA || "0.00"}
              </Typography>
            ) : (
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  opacity: 0.5,
                }}
              >
                •••••
              </Typography>
            )}
          </Box>

          {/* Technical GPA Card */}
          <Box
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: "45%" },
              p: 3,
              borderRadius: 2,
              backgroundColor: alpha(
                muiTheme.palette.primary.main,
                isDark ? 0.15 : 0.08
              ),
              border: "1px solid",
              borderColor: alpha(
                muiTheme.palette.primary.main,
                isDark ? 0.3 : 0.2
              ),
            }}
            data-major-gpa="true"
            className="MajorGpa-container"
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Computer size={20} color={muiTheme.palette.primary.main} />
                <Typography
                  variant="subtitle1"
                  sx={{ ml: 1, fontWeight: 600, color: "text.secondary" }}
                >
                  Major GPA
                </Typography>
              </Box>
              <Tooltip title={hiddenGPAs.major ? "Show GPA" : "Hide GPA"}>
                <IconButton 
                  onClick={toggleMajorGPA} 
                  size="small"
                  sx={{
                    backgroundColor: alpha(
                      hiddenGPAs.major
                        ? muiTheme.palette.warning.main
                        : muiTheme.palette.primary.main,
                      0.15
                    ),
                    color: hiddenGPAs.major
                      ? muiTheme.palette.warning.main
                      : muiTheme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: alpha(
                        hiddenGPAs.major
                          ? muiTheme.palette.warning.main
                          : muiTheme.palette.primary.main,
                        0.25
                      ),
                    },
                  }}
                >
                  {hiddenGPAs.major ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              </Tooltip>
            </Box>
            {!hiddenGPAs.major ? (
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                {centralGPA.majorGPA || "0.00"}
              </Typography>
            ) : (
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  opacity: 0.5,
                }}
              >
                •••••
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Edit />}
            onClick={handleEditGPA}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: 4,
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            Edit GPA Information
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Update your GPA information as you complete more courses
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default GPAInfoCard; 