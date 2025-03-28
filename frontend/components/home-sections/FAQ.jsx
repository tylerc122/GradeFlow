import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import {
  ChevronDown,
  HelpCircle,
  Shield,
  School,
  Calculator,
  ClipboardCheck,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

const FAQ = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // FAQs with added icons but original text content preserved
  const faqs = [
    {
      question: "Is my grade data secure?",
      answer:
        "Yes! Your grade data is secure. When using the calculator without an account, all calculations are performed client-side in your browser and immediately discarded. If you choose to save your calculations by creating an account, your data is securely stored and only accessible to you when logged in.",
      icon: <Shield size={20} />,
      color: theme.palette.success.main,
    },
    {
      question: "Can I still use this if my university doesn't use Blackboard?",
      answer:
        "Yes, but no. Currently, we only support Blackboard grade data alongside our smart categories feature. Though you can still use GradeFlow as a way to manually calculate your grades and engage in hypothetical grade situations.",
      icon: <School size={20} />,
      color: theme.palette.warning.main,
    },
    {
      question: "How should I input my grades from Blackboard?",
      answer:
        "Simply navigate to your 'Grades' section on Blackboard, hit ctrl + a, ctrl + c and then ctrl + v to paste into our calculator. It's that simple!",
      icon: <ClipboardCheck size={20} />,
      color: theme.palette.info.main,
    },
    {
      question: "What if my professor uses a different grading system?",
      answer:
        "Our calculator allows you to customize category weights and grading structures to match your professor's specific grading system.",
      icon: <Calculator size={20} />,
      color: theme.palette.primary.main,
    },
    {
      question: "Can I calculate my required scores for future assignments?",
      answer:
        'Yes! Our "What-If" analysis feature lets you input hypothetical scores for upcoming assignments to see how they would affect your final grade.',
      icon: <Target size={20} />,
      color: theme.palette.secondary.main,
    },
  ];

  return (
    <Box
      sx={{
        py: 8,
        bgcolor: "background.paper",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: alpha(theme.palette.primary.main, 0.03),
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: alpha(theme.palette.secondary.main, 0.03),
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mb: 6,
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "14px",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HelpCircle size={28} color="#ffffff" />
          </Box>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 700,
              background: "var(--gradient-primary)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            }}
          >
            Frequently Asked Questions
          </Typography>
        </Box>

        <Paper
          elevation={2}
          sx={{
            maxWidth: 800,
            mx: "auto",
            borderRadius: "24px",
            overflow: "hidden",
            p: 2,
          }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
              }}
              style={{ marginBottom: '16px' }}
            >
              <Accordion
                expanded={expanded === `panel${index}`}
                onChange={handleChange(`panel${index}`)}
                sx={{
                  "&:before": { display: "none" },
                  boxShadow: "none",
                  borderRadius: "16px !important",
                  overflow: "hidden",
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  "&.Mui-expanded": {
                    boxShadow: `0 4px 20px ${alpha(faq.color, 0.15)}`,
                    border: `1px solid ${alpha(faq.color, 0.3)}`,
                    background: `linear-gradient(145deg, ${alpha(
                      faq.color,
                      0.05
                    )} 0%, ${alpha(faq.color, 0.02)} 100%)`,
                  },
                  "&:hover": {
                    boxShadow:
                      expanded === `panel${index}`
                        ? `0 4px 20px ${alpha(faq.color, 0.15)}`
                        : theme.shadows[2],
                  },
                  "&:focus": {
                    outline: "none",
                  },
                  "&.MuiAccordion-root.Mui-focused": {
                    outline: "none",
                    boxShadow: expanded === `panel${index}`
                      ? `0 4px 20px ${alpha(faq.color, 0.15)}`
                      : theme.shadows[2],
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          expanded === `panel${index}`
                            ? alpha(faq.color, 0.1)
                            : alpha(theme.palette.action.hover, 0.5),
                        color:
                          expanded === `panel${index}`
                            ? faq.color
                            : theme.palette.text.secondary,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <ChevronDown size={16} />
                    </Box>
                  }
                  sx={{
                    minHeight: 64,
                    p: 2,
                    "&.Mui-expanded": {
                      minHeight: 64,
                    },
                    "&:focus": {
                      outline: "none",
                      backgroundColor: "transparent",
                    },
                    "& .MuiAccordionSummary-content": {
                      margin: 0,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "10px",
                        backgroundColor: alpha(
                          faq.color,
                          expanded === `panel${index}` ? 0.15 : 0.1
                        ),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: faq.color,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {faq.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: expanded === `panel${index}` ? 600 : 500,
                        color:
                          expanded === `panel${index}`
                            ? faq.color
                            : theme.palette.text.primary,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  pt: 0,
                  pb: 0.5
                }}>
                  <Divider 
                    sx={{ 
                      backgroundColor: alpha(faq.color, 0.4),
                      height: expanded === `panel${index}` ? 1 : 0,
                      width: '50%',
                      transition: "all 0.3s ease",
                      opacity: expanded === `panel${index}` ? 1 : 0,
                    }} 
                  />
                </Box>
                
                <AccordionDetails sx={{ p: 3, pt: 1.5, mt: 0 }}>
                  <Typography
                    color="text.secondary"
                    sx={{
                      pl: 5,
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Paper>
      </Container>
    </Box>
  );
};

export default FAQ;
