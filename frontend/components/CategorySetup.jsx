import React, { useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Stack,
  Alert,
  alpha,
  useTheme as useMuiTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import { useTheme } from "../src/contexts/ThemeContext";

const CategorySetup = ({ categories, setCategories, error, setError }) => {
  const muiTheme = useMuiTheme();
  const { mode, isDark } = useTheme();

  // Load categories from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('gradeCategories');
    if (savedCategories && (!categories || categories.length === 0)) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Failed to parse saved categories:', error);
      }
    }
  }, []);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (categories && categories.length > 0) {
      localStorage.setItem('gradeCategories', JSON.stringify(categories));
    }
  }, [categories]);

  const addEmptyCategory = () => {
    setCategories([...categories, { name: "", weight: "" }]);
  };

  const validateCategory = (category, index) => {
    if (!category.name || !category.weight) {
      return false;
    }

    const weight = parseFloat(category.weight);
    if (isNaN(weight) || weight <= 0 || weight > 100) {
      return false;
    }

    const totalWeight = categories.reduce((sum, cat, i) => {
      if (i === index) return sum;
      return sum + (parseFloat(cat.weight) || 0);
    }, weight);

    return Math.abs(totalWeight - 100) < 0.01;
  };

  const handleCategoryChange = (index, field, value) => {
    if (field === "weight") {
      // Remove any non-numeric characters except decimal point
      let cleanValue = value.replace(/[^\d.]/g, "");

      // Ensure only one decimal point
      const decimalCount = (cleanValue.match(/\./g) || []).length;
      if (decimalCount > 1) {
        cleanValue = cleanValue.replace(/\./g, (match, index) =>
          index === cleanValue.indexOf(".") ? match : ""
        );
      }

      // Handle double-digit restriction
      const parts = cleanValue.split(".");
      if (parts[0].length > 2) {
        parts[0] = parts[0].slice(0, 2);
      }
      cleanValue = parts.join(".");

      // Parse and validate the value
      const numericValue = parseFloat(cleanValue);
      if (!isNaN(numericValue) && numericValue > 100) {
        cleanValue = "100";
      }

      value = cleanValue;
    }

    const newCategories = [...categories];
    newCategories[index][field] = value;
    setCategories(newCategories);
  };

  const handleDeleteCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const totalWeight = categories.reduce(
    (sum, cat) => sum + (parseFloat(cat.weight) || 0),
    0
  );

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: isDark
          ? "linear-gradient(145deg, #1e1e1e 0%, #252525 100%)"
          : "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      }}
    >
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CategoryIcon
              sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Grade Categories
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={addEmptyCategory}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 2,
              "&:hover": {
                boxShadow: 4,
              },
            }}
          >
            Add Category
          </Button>
        </Box>

        <Stack spacing={2}>
          {categories.map((category, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: validateCategory(category, index)
                  ? "divider"
                  : "error.main",
                transition: "all 0.2s ease-in-out",
                backgroundColor: isDark ? "#252525" : "white",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 2,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <TextField
                  size="medium"
                  label="Category Name"
                  value={category.name}
                  onChange={(e) =>
                    handleCategoryChange(index, "name", e.target.value)
                  }
                  sx={{
                    flexGrow: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: isDark ? "#252525" : "white",
                    },
                  }}
                  error={!category.name}
                />
                <TextField
                  size="medium"
                  label="Weight (%)"
                  type="number"
                  value={category.weight}
                  onChange={(e) =>
                    handleCategoryChange(index, "weight", e.target.value)
                  }
                  onWheel={(e) => e.target.blur()}
                  sx={{
                    width: "150px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: isDark ? "#252525" : "white",
                    },
                  }}
                  error={!validateCategory(category, index)}
                />
                <IconButton
                  onClick={() => handleDeleteCategory(index)}
                  sx={{
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: alpha("#f44336", 0.08),
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Stack>

        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(
              totalWeight === 100 ? "#4caf50" : "#f44336",
              isDark ? 0.15 : 0.08
            ),
            border: "1px solid",
            borderColor: alpha(
              totalWeight === 100 ? "#4caf50" : "#f44336",
              isDark ? 0.3 : 0.2
            ),
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: totalWeight === 100 ? "success.main" : "error.main",
            }}
          >
            Total Weight: {totalWeight}%
          </Typography>
          {totalWeight !== 100 && (
            <Typography
              color="error"
              variant="body2"
              sx={{ mt: 1, fontWeight: 500 }}
            >
              {totalWeight < 100
                ? `${(100 - totalWeight).toFixed(1)}% remaining to allocate`
                : `${(totalWeight - 100).toFixed(1)}% over maximum`}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default CategorySetup;
