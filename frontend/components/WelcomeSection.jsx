import React from "react";
import { Paper, Typography, Box, Stack, useTheme } from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import CalculateIcon from "@mui/icons-material/Calculate";
import CategoryIcon from "@mui/icons-material/Category";

const WelcomeSection = () => {
  const theme = useTheme();

  return (
    <Stack spacing={4}>
      {/* Welcome Message */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "white",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: "2rem",
          }}
        >
          Welcome to GradeFlow
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "1.1rem",
          }}
        >
          Calculate your grades instantly by pasting directly from Blackboard
        </Typography>
      </Paper>

      {/* How It Works */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: "white",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 3,
            color: theme.palette.text.primary,
          }}
        >
          How It Works
        </Typography>
        <Stack spacing={3}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <CategoryIcon color="primary" sx={{ fontSize: 24 }} />
            <Typography sx={{ color: theme.palette.text.secondary }}>
              Set up your grade categories and their weights
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <ContentPasteIcon color="primary" sx={{ fontSize: 24 }} />
            <Typography sx={{ color: theme.palette.text.secondary }}>
              Copy and paste your grades directly from Blackboard
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <AutoGraphIcon color="primary" sx={{ fontSize: 24 }} />
            <Typography sx={{ color: theme.palette.text.secondary }}>
              Our system automatically categorizes your assignments
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <CalculateIcon color="primary" sx={{ fontSize: 24 }} />
            <Typography sx={{ color: theme.palette.text.secondary }}>
              Get instant calculations and grade predictions
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Sample Format */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: "white",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 3,
            color: theme.palette.text.primary,
          }}
        >
          Sample Format
        </Typography>
        <Box
          sx={{
            p: 3,
            bgcolor: theme.palette.grey[50],
            borderRadius: 2,
            fontFamily: "monospace",
            fontSize: "0.875rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {`Quiz 1\nTest\n\nSep 11, 2024 6:13 PM\nGRADED\n14.00\n/14`}
        </Box>
      </Paper>
    </Stack>
  );
};

export default WelcomeSection;
