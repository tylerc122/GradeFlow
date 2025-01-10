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
  Link,
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
              As a college student whose university uses Blackboard, I found
              myself constantly checking my grades, rechecking them, and
              checking them one more time—each time manually. It was tedious and
              redundant, and I wanted to find a way to expedite the process.
            </Typography>
            <Typography variant="body1" paragraph>
              That's when I had the idea for GradeFlow. I noticed that
              Blackboard's grade format was consistent—it always displayed
              grades in the same structure. Why not create a tool that could
              automatically parse this format and perform all the calculations
              instantly?
            </Typography>
            <Typography variant="body1" paragraph>
              Using JSX/React for the frontend and Python FastAPI for the
              backend, I built a system that could not only parse grades but
              also intelligently categorize assignments at the click of a
              button. The project evolved to include features like what-if
              analysis and grade projections, making it a comprehensive tool for
              students facing the same problem as I did.
            </Typography>
            <Typography variant="body1" paragraph>
              I hope you find GradeFlow as useful as I do. If you have any
              questions or feedback, please don't hesitate to reach out through
              any of my links below!
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              backgroundColor: "background.paper",
              height: "auto",
            }}
          >
            <Grid container spacing={4} alignItems="flex-start">
              {/* Profile Picture Column */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                    mb: { xs: 2, md: 0 },
                    maxHeight: "600px",
                  }}
                >
                  <Box
                    component="img"
                    src="./me.jpg"
                    alt="Tyler Collo"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.02)",
                      },
                    }}
                  />
                </Box>
              </Grid>

              {/* Bio Content Column */}
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Tyler Collo
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: "5%", ml: "2px" }}
                  >
                    Student & Developer
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Computer Science student at George Washington University,
                    currently working at{" "}
                    <Link
                      href="https://gyfrapp.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Gyfr
                    </Link>
                    .
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    I'm currently studying Computer Science with a focus passion
                    for game/web development and AI. When I'm not coding, you
                    can find me at the piano, playing video games, or reading.
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Feel free to reach out if you have any questions about
                    GradeFlow or just want to connect!
                  </Typography>

                  {/* Social Links */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      mt: "auto",
                      pt: 2,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    {socialLinks.map((social, index) => (
                      <IconButton
                        key={index}
                        component="a"
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "primary.main",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            backgroundColor: "rgba(44, 62, 80, 0.04)",
                          },
                        }}
                        aria-label={social.label}
                      >
                        {social.icon}
                      </IconButton>
                    ))}
                    <Button
                      startIcon={<EmailIcon />}
                      variant="contained"
                      href="mailto:tylercollo1@gmail.com"
                      sx={{
                        ml: "auto",
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      Contact Me
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AboutPage;
