import React from "react";
import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

const stats = [
  {
    icon: (
      <SchoolOutlinedIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
    ),
    value: "50+",
    label: "Universities",
  },
  {
    icon: (
      <VerifiedOutlinedIcon
        sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
      />
    ),
    value: "99%",
    label: "Accuracy",
  },
  {
    icon: (
      <PeopleAltOutlinedIcon
        sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
      />
    ),
    value: "10K+",
    label: "Students",
  },
];

const SocialProof = () => (
  <Box sx={{ py: 8, bgcolor: "background.default" }}>
    <Container maxWidth="lg">
      <Grid container spacing={4} justifyContent="center">
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              elevation={2}
              sx={{
                py: 4,
                px: 3,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              {stat.icon}
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default SocialProof;
