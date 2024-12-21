import React from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const CategorySetup = ({ categories, setCategories, error, setError }) => {
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

    const totalWeight = categories.reduce(
      (sum, cat, i) => (i === index ? sum : sum + parseFloat(cat.weight || 0)),
      weight
    );

    return totalWeight <= 100;
  };

  const handleCategoryChange = (index, field, value) => {
    const newCategories = [...categories];
    newCategories[index][field] = value;

    // Validate the updated category
    const isValid = validateCategory(newCategories[index], index);

    if (!isValid) {
      setError(
        "Please check category names and weights (0-100%). Total weight cannot exceed 100%."
      );
    } else {
      // Only clear the error if all categories are valid
      const allValid = newCategories.every((cat, i) =>
        validateCategory(cat, i)
      );
      if (allValid) {
        setError("");
      }
    }

    setCategories(newCategories);
  };

  const handleDeleteCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);

    // Revalidate all categories after deletion
    const allValid = newCategories.every((cat, i) => validateCategory(cat, i));
    if (allValid) {
      setError("");
    }
  };

  const totalWeight = categories.reduce(
    (sum, cat) => sum + (parseFloat(cat.weight) || 0),
    0
  );
  const isValidSetup =
    categories.length > 0 &&
    categories.every((cat, i) => validateCategory(cat, i)) &&
    totalWeight === 100;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">Grade Categories</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={addEmptyCategory}
        >
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {categories.map((category, index) => (
          <ListItem
            key={index}
            sx={{
              bgcolor: "background.paper",
              mb: 1,
              borderRadius: 1,
              border: "1px solid",
              borderColor: validateCategory(category, index)
                ? "divider"
                : "error.main",
            }}
          >
            <Box
              sx={{
                display: "flex",
                width: "100%",
                gap: 2,
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                label="Category Name"
                value={category.name}
                onChange={(e) =>
                  handleCategoryChange(index, "name", e.target.value)
                }
                sx={{ flexGrow: 1 }}
                error={!category.name}
              />
              <TextField
                size="small"
                label="Weight"
                type="number"
                value={category.weight}
                onChange={(e) =>
                  handleCategoryChange(index, "weight", e.target.value)
                }
                InputProps={{
                  endAdornment: "%",
                }}
                sx={{ width: "120px" }}
                error={!validateCategory(category, index)}
              />
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteCategory(index)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          color={totalWeight === 100 ? "text.secondary" : "error"}
          sx={{ fontWeight: totalWeight === 100 ? "normal" : "bold" }}
        >
          Total Weight: {totalWeight}%
        </Typography>
        {!isValidSetup && (
          <Typography color="error" variant="caption">
            {totalWeight < 100
              ? "Total weight must equal 100%"
              : totalWeight > 100
              ? "Total weight exceeds 100%"
              : "Please complete all category information"}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default CategorySetup;
