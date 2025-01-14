import React from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
  {
    question: "Is my grade data secure?",
    answer:
      "Yes! Your grade data is secure. When using the calculator without an account, all calculations are performed client-side in your browser and immediately discarded. If you choose to save your calculations by creating an account, your data is securely stored and only accessible to you when logged in.",
  },

  {
    question: "Can I still use this if my university doesn't use Blackboard?",
    answer:
      "Yes, but no. Currently, we only support Blackboard grade data alongside our smart categories feature. Though you can still use GradeFlow as a way to manually calculate your grades and engage in hypothetical grade situations.",
  },
  {
    question: "How accurate is the grade calculation?",
    answer:
      "Our grade calculator is highly accurate as it directly processes the raw data from Blackboard. The system uses the exact same grading structure and weights that your professors use.",
  },
  {
    question: "What if my professor uses a different grading system?",
    answer:
      "Our calculator allows you to customize category weights and grading structures to match your professor's specific grading system.",
  },
  {
    question: "Can I calculate my required scores for future assignments?",
    answer:
      'Yes! Our "What-If" analysis feature lets you input hypothetical scores for upcoming assignments to see how they would affect your final grade.',
  },
];

const FAQ = () => (
  <Box sx={{ py: 8, bgcolor: "background.paper" }}>
    <Container maxWidth="md">
      <Typography variant="h3" align="center" sx={{ mb: 6, fontWeight: 600 }}>
        Frequently Asked Questions
      </Typography>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 2,
              "&:before": { display: "none" },
              boxShadow: 1,
              borderRadius: "8px!important",
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                "&.Mui-expanded": {
                  minHeight: 64,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  </Box>
);

export default FAQ;
