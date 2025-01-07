import React from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  IconButton,
  useTheme,
  Button,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Person from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const socialLinks = [
    {
      icon: <GitHubIcon sx={{ fontSize: 32 }} />,
      url: "https://github.com/tylerc122",
      label: "GitHub",
    },
    {
      icon: <LinkedInIcon sx={{ fontSize: 32 }} />,
      url: "https://www.linkedin.com/in/tyler-collo-345679276/",
      label: "LinkedIn",
    },
    {
      icon: <Person sx={{ fontSize: 32 }} />,
      url: "https://www.tylercollo.com/",
      label: "Twitter",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={6}>
        {/* Project Story Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              The Story Behind GradeFlow
            </Typography>
            <Typography variant="body1" paragraph>
              As a student at [Your University], I constantly found myself
              copying and pasting grades from Blackboard into spreadsheets,
              trying to calculate my current standing in each class. It was a
              tedious process that I knew could be automated.
            </Typography>
            <Typography variant="body1" paragraph>
              That's when I had the idea for GradeFlow. I noticed that
              Blackboard's grade format was consistent - it always displayed
              grades in the same structure. Why not create a tool that could
              automatically parse this format and do all the calculations
              instantly?
            </Typography>
            <Typography variant="body1" paragraph>
              Using React for the frontend and FastAPI for the backend, I built
              a system that could not only parse grades but also intelligently
              categorize assignments. The project evolved to include features
              like what-if analysis and grade projections, making it a
              comprehensive tool for students.
            </Typography>
          </Paper>
        </Grid>

        {/* About Me Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
              <Box
                component="img"
                src="/api/placeholder/120/120"
                alt="Profile"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  mr: 4,
                }}
              />
              <Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                  Tyler Collo
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Student & Developer
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Computer Science student at [Your University], passionate
                  about building tools that make students' lives easier.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" paragraph>
                I'm currently studying Computer Science with a focus on web
                development and artificial intelligence. When I'm not coding,
                you can find me [your interests/hobbies].
              </Typography>
              <Typography variant="body1">
                Feel free to reach out if you have any questions about GradeFlow
                or just want to connect!
              </Typography>
            </Box>

            {/* Social Links */}
            <Box sx={{ display: "flex", gap: 2 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "primary.main",
                    "&:hover": {
                      transform: "translateY(-2px)",
                    },
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
              <Button
                startIcon={<EmailIcon />}
                variant="outlined"
                href="mailto:tylercollo1@gmail.com"
                sx={{ ml: 2 }}
              >
                Contact Me
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AboutPage;
