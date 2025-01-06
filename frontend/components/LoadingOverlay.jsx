import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

const LoadingOverlay = ({ message = "Processing your grades..." }) => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: alpha("#fff", 0.8),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <CircularProgress size={60} thickness={4} />
    <Typography
      variant="h6"
      sx={{
        mt: 3,
        color: "text.primary",
        textAlign: "center",
        maxWidth: "80%",
      }}
    >
      {message}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mt: 2, textAlign: "center", maxWidth: "80%" }}
    >
      This may take a few moments as we analyze and categorize your
      assignments...
    </Typography>
  </Box>
);

export default LoadingOverlay;
