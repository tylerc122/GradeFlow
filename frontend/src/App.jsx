import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import axios from "axios";

function App() {
  const [rawData, setRawData] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      const response = await axios.post(
        "http://localhost:8000/api/grades/calculate/raw",
        rawData,
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
      setResults(response.data);
    } catch (err) {
      setError("Error calculating grades. Please check your input.");
      console.error(err);
    }
  };

  const calculatePercentage = (score, total) => {
    if (total === 0) return "-";
    return ((score / total) * 100).toFixed(1) + "%";
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Grade Calculator
        </Typography>

        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Paste your Blackboard grades
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Copy and paste directly from Blackboard's grade center. Make sure to
            include all assignment details.
          </Alert>
          <TextField
            multiline
            fullWidth
            rows={10}
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="Paste your grades here..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleSubmit} size="large">
            Calculate Grades
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {results && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                Overall Grade: {results.overall_grade.toFixed(2)}%
              </Typography>
              <Typography variant="h6">
                Total Points: {results.total_points_earned} /{" "}
                {results.total_points_possible}
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assignment</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Total Points</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.assignments.map((assignment, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor:
                          assignment.status === "UPCOMING"
                            ? "#f5f5f5"
                            : assignment.score === 0
                            ? "#fff4f4"
                            : "inherit",
                      }}
                    >
                      <TableCell>
                        <Typography
                          fontWeight={
                            assignment.assignment_type === "Test"
                              ? "bold"
                              : "normal"
                          }
                        >
                          {assignment.name}
                        </Typography>
                        {assignment.assignment_type && (
                          <Typography variant="caption" color="text.secondary">
                            {assignment.assignment_type}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {assignment.status === "UPCOMING"
                          ? "-"
                          : assignment.score}
                      </TableCell>
                      <TableCell align="right">
                        {assignment.total_points}
                      </TableCell>
                      <TableCell align="right">
                        {assignment.status === "UPCOMING"
                          ? "-"
                          : calculatePercentage(
                              assignment.score,
                              assignment.total_points
                            )}
                      </TableCell>
                      <TableCell>{assignment.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default App;
