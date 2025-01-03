import React from "react";
import { Paper, Typography, Box, Button, Stack, alpha } from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import EditIcon from "@mui/icons-material/Edit";
import BlackboardInput from "./BlackboardInput";
import ManualInput from "./ManualInput";

const GradeInput = ({
  mode,
  setMode,
  rawGradeData,
  setRawGradeData,
  categories,
  setGrades,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      }}
    >
      <Stack spacing={4}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {mode === "blackboard" ? (
            <ContentPasteIcon
              sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
            />
          ) : (
            <EditIcon
              sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
            />
          )}
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Input Grades
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant={mode === "manual" ? "contained" : "outlined"}
            onClick={() => setMode("manual")}
            sx={{ flex: 1, py: 2 }}
          >
            Manual Input
          </Button>
          <Button
            variant={mode === "blackboard" ? "contained" : "outlined"}
            onClick={() => setMode("blackboard")}
            sx={{ flex: 1, py: 2 }}
          >
            Blackboard Import
          </Button>
        </Box>

        {mode === "blackboard" ? (
          <BlackboardInput
            rawGradeData={rawGradeData}
            setRawGradeData={setRawGradeData}
          />
        ) : (
          <ManualInput categories={categories} setGrades={setGrades} />
        )}
      </Stack>
    </Paper>
  );
};

export default GradeInput;
