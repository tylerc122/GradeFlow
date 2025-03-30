import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  alpha,
  Divider,
  useTheme as useMuiTheme,
  Chip,
} from "@mui/material";
import { School, Computer, Edit, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGPA } from "../src/contexts/GPAContext";
import { useTheme } from "../src/contexts/ThemeContext";

const GPADashboardCard = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { isDark } = useTheme();
  const { centralGPA, editGPA } = useGPA();

  const formatDate = (dateString) => {
    if (!dateString) return "Never updated";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleEditGPA = () => {
    editGPA();
    navigate("/gpa-calculator");
  };

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: "20px",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 12px 20px ${alpha(muiTheme.palette.primary.main, 0.15)}`,
        },
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Decorative accent */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: `linear-gradient(90deg, ${muiTheme.palette.primary.main} 0%, ${alpha(
            muiTheme.palette.secondary.main,
            0.4
          )} 100%)`,
        }}
      />

      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Your GPA
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "12px",
              bgcolor: alpha(muiTheme.palette.primary.main, 0.1),
              color: muiTheme.palette.primary.main,
            }}
          >
            <School size={24} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle1" color="text.secondary">
            {centralGPA.name || "My GPA"}
          </Typography>
          <Chip
            icon={<Calendar size={14} />}
            label={`Updated: ${formatDate(centralGPA.lastUpdated)}`}
            size="small"
            sx={{ 
              ml: 2, 
              fontWeight: 500,
              fontSize: "0.7rem",
              height: 22,
              bgcolor: alpha(muiTheme.palette.info.main, 0.1),
              color: muiTheme.palette.info.main,
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <School size={16} color={muiTheme.palette.success.main} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1, fontWeight: 500 }}
            >
              Overall GPA
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: muiTheme.palette.success.main,
            }}
          >
            {centralGPA.overallGPA || "0.00"}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Computer size={16} color={muiTheme.palette.primary.main} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1, fontWeight: 500 }}
            >
              Technical GPA
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: muiTheme.palette.primary.main,
            }}
          >
            {centralGPA.technicalGPA || "0.00"}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          fullWidth
          startIcon={<Edit size={16} />}
          onClick={handleEditGPA}
          sx={{
            mt: 2,
            borderRadius: "12px",
            py: 1,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Update GPA
        </Button>
      </CardContent>
    </Card>
  );
};

export default GPADashboardCard; 