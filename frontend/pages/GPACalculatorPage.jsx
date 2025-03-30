import React from "react";
import { Container, Typography, Box, Paper, alpha } from "@mui/material";
import { motion } from "framer-motion";
import GPACalculator from "../components/GPACalculator";
import GPAInfoCard from "../components/GPAInfoCard";
import { useTheme } from "../src/contexts/ThemeContext";
import { useGPA } from "../src/contexts/GPAContext";

const GPACalculatorPage = () => {
  const { isDark } = useTheme();
  const { isEditing } = useGPA();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: isDark
                ? "linear-gradient(90deg, #3f51b5 0%, #4caf50 100%)"
                : "linear-gradient(90deg, #303f9f 0%, #2e7d32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textFillColor: "transparent",
            }}
          >
            GPA Calculator
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ maxWidth: 650, mx: "auto" }}
          >
            Track both your overall and major-specific GPA in one place. 
            Easily update your GPA as you complete more courses throughout your academic journey.
          </Typography>
        </Box>

        {isEditing ? (
          <GPACalculator />
        ) : (
          <GPAInfoCard />
        )}
      </Container>
    </motion.div>
  );
};

export default GPACalculatorPage; 