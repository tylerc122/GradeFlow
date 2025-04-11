/**
 * Tutorial dialog that shows a guide on how to use Gradeflow.
 * Pops up when user first opens the calculator and can be accessed again through WelcomeSection.
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  MobileStepper,
  Paper,
  useTheme as useMuiTheme,
  alpha,
} from '@mui/material';
import { X, ChevronLeft, ChevronRight, HelpCircle, Award, Copy, BarChart2, Calculator, Sparkles } from 'lucide-react';
import { useTheme } from '../../src/contexts/ThemeContext';
import { motion } from 'framer-motion';

const TutorialDialog = ({ open, onClose }) => {
  const theme = useMuiTheme();
  const { isDark } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});
  
  // Generate image paths based on theme
  const getImagePath = (baseName) => {
    // Handle special case for tutorial-input.png which doesn't have dark/light variants
    if (baseName === 'tutorial-input') {
      return '/tutorial-input.png';
    }
    
    // Handle special case for tutorial-results using grade.png/dark.png
    if (baseName === 'tutorial-results') {
      return isDark ? '/dark.png' : '/grade.png';
    }
    
    return `/${baseName}-${isDark ? 'dark' : 'light'}.png`;
  };

  const tutorialSteps = [
    {
      label: 'Welcome to GradeFlow',
      icon: <Sparkles size={30} />,
      description: 'GradeFlow helps you instantly calculate your grades by automatically categorizing assignments and providing accurate calculations.',
      imageBase: 'tutorial-welcome',
    },
    {
      label: 'Step 1: Set Up Categories',
      icon: <Award size={30} />,
      description: 'Start by setting up your grade categories and their weights. You can customize these based on your syllabus.',
      imageBase: 'tutorial-categories',
    },
    {
      label: 'Step 2: Input Your Grades',
      icon: <Copy size={30} />,
      description: 'Copy your grades directly from Blackboard and paste them into GradeFlow. The system will recognize the format automatically.',
      imageBase: 'tutorial-input',
    },
    {
      label: 'Step 3: Auto-Categorization',
      icon: <BarChart2 size={30} />,
      description: 'Our advanced algorithm automatically categorizes your assignments based on their names and types.',
      imageBase: 'tutorial-categorization',
    },
    {
      label: 'Step 4: View Your Results',
      icon: <Calculator size={30} />,
      description: 'Get instant calculations of your current grade, along with predictions for what you need on remaining assignments.',
      imageBase: 'tutorial-results',
    },
  ];

  // Reset image loading state when theme changes
  useEffect(() => {
    setImagesLoaded({});
  }, [isDark]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };
  
  // Handle image loading success
  const handleImageLoaded = (index) => {
    setImagesLoaded(prev => ({
      ...prev,
      [index]: true
    }));
    // console.log(`Image ${index} loaded successfully:`, getImagePath(tutorialSteps[index].imageBase));
  };
  
  // Handle image loading error
  const handleImageError = (index) => {
    console.error(`Failed to load image ${index}:`, getImagePath(tutorialSteps[index].imageBase));
    // If dark mode image fails, try to fall back to light mode
    if (isDark && tutorialSteps[index].imageBase !== 'tutorial-input' && tutorialSteps[index].imageBase !== 'tutorial-results') {
      const imgElement = document.getElementById(`tutorial-img-${index}`);
      if (imgElement) {
        // console.log(`Trying fallback to light mode image for ${index}`);
        const fallbackPath = `/${tutorialSteps[index].imageBase}-light.png`;
        imgElement.src = fallbackPath;
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          bgcolor: isDark ? '#1e1e1e' : 'white',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.primary.main,
            }}
          >
            <HelpCircle size={24} />
          </Box>
          Quick Start Guide
        </Typography>
        <IconButton onClick={handleClose} edge="end" aria-label="close">
          <X />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 4, px: 3 }}>
        <Box sx={{ position: 'relative', height: '650px', width: '100%', mb: 2 }}>
          {tutorialSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 100 }}
              animate={{ 
                opacity: activeStep === index ? 1 : 0,
                x: activeStep === index ? 0 : 100,
                display: activeStep === index ? 'block' : 'none'
              }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', width: '100%', position: 'absolute' }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'flex-start',
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '20px',
                    background: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                >
                  {step.icon}
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
                  {step.label}
                </Typography>
                
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, maxWidth: '650px' }}>
                  {step.description}
                </Typography>
                
                {step.imageBase && (
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: '800px',
                      height: '430px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    <img
                      id={`tutorial-img-${index}`}
                      src={getImagePath(step.imageBase)}
                      alt={step.label}
                      onLoad={() => handleImageLoaded(index)}
                      onError={() => handleImageError(index)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        padding: '8px'
                      }}
                    />
                  </Paper>
                )}
              </Box>
            </motion.div>
          ))}
        </Box>

        <MobileStepper
          variant="dots"
          steps={tutorialSteps.length}
          position="static"
          activeStep={activeStep}
          sx={{ 
            bgcolor: 'transparent',
            '& .MuiMobileStepper-dot': {
              mx: 0.5,
              width: 10,
              height: 10,
            },
            '& .MuiMobileStepper-dotActive': {
              bgcolor: theme.palette.primary.main,
            }
          }}
          nextButton={
            activeStep === tutorialSteps.length - 1 ? (
              <Button 
                variant="contained"
                onClick={handleClose}
                sx={{ 
                  borderRadius: '10px',
                  px: 3,
                }}
              >
                Get Started
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                sx={{ 
                  borderRadius: '10px',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
                endIcon={<ChevronRight />}
              >
                Next
              </Button>
            )
          }
          backButton={
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ 
                borderRadius: '10px',
                color: activeStep === 0 ? theme.palette.text.disabled : theme.palette.primary.main,
                '&:hover': {
                  bgcolor: activeStep === 0 ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
                }
              }}
              startIcon={<ChevronLeft />}
            >
              Back
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default TutorialDialog; 