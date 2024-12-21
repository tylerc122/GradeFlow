import React from "react";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from "@mui/material";

export const AssignmentTable = ({
  categories,
  hypotheticalAssignments,
  hypotheticalScores,
  whatIfMode,
  setSelectedCategory,
  setSelectedAssignment,
  setEditDialogOpen,
}) => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>
      Detailed Assignment Breakdown
    </Typography>
    {categories.map((category, categoryIndex) => (
      <Box key={categoryIndex} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {category.name}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Assignment</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Total Points</TableCell>
                <TableCell align="right">Percentage</TableCell>
                {whatIfMode && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ...category.assignments,
                ...hypotheticalAssignments
                  .filter((a) => a.categoryName === category.name)
                  .map((a) => ({ ...a, isHypothetical: true })),
              ].map((assignment, assignmentIndex) => (
                <TableRow
                  key={assignmentIndex}
                  sx={{
                    backgroundColor: assignment.isHypothetical
                      ? "action.hover"
                      : assignment.status === "UPCOMING"
                      ? hypotheticalScores[
                          `${category.name}-${assignment.name}`
                        ]
                        ? "action.hover"
                        : "grey.100"
                      : "inherit",
                  }}
                >
                  <TableCell>
                    {assignment.name}
                    {assignment.isHypothetical && (
                      <Chip
                        size="small"
                        label="Hypothetical"
                        color="info"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">{assignment.status}</TableCell>
                  <TableCell align="right">
                    {assignment.status === "UPCOMING"
                      ? hypotheticalScores[
                          `${category.name}-${assignment.name}`
                        ]?.score || "-"
                      : assignment.score}
                  </TableCell>
                  <TableCell align="right">{assignment.total_points}</TableCell>
                  <TableCell align="right">
                    {assignment.status === "UPCOMING"
                      ? hypotheticalScores[
                          `${category.name}-${assignment.name}`
                        ]
                        ? (
                            (hypotheticalScores[
                              `${category.name}-${assignment.name}`
                            ].score /
                              assignment.total_points) *
                            100
                          ).toFixed(1) + "%"
                        : "-"
                      : (
                          (assignment.score / assignment.total_points) *
                          100
                        ).toFixed(1) + "%"}
                  </TableCell>
                  {whatIfMode && (
                    <TableCell align="right">
                      {(assignment.status === "UPCOMING" ||
                        assignment.isHypothetical) && (
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedCategory(category.name);
                            setSelectedAssignment(assignment);
                            setEditDialogOpen(true);
                          }}
                        >
                          {hypotheticalScores[
                            `${category.name}-${assignment.name}`
                          ] || assignment.isHypothetical
                            ? "Edit Score"
                            : "Add Score"}
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    ))}
  </Paper>
);
