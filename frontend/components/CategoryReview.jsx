import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Paper, Typography, Alert, Box, Stack, alpha } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentIcon from "@mui/icons-material/Assignment";

const CategoryReview = ({
  parsedGrades,
  uncategorizedAssignments,
  categories,
  handleDragEnd,
}) => {
  if (!parsedGrades || !uncategorizedAssignments) {
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
        <Typography variant="h6" color="error">
          No grade data available. Please go back and input your grades.
        </Typography>
      </Paper>
    );
  }

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
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CategoryIcon
            sx={{ fontSize: 32, color: "primary.main", opacity: 0.8 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Review and Categorize Assignments
          </Typography>
        </Box>

        <Alert
          severity="info"
          sx={{
            backgroundColor: alpha("#2196f3", 0.08),
            border: "1px solid",
            borderColor: alpha("#2196f3", 0.2),
            "& .MuiAlert-icon": { color: "primary.main" },
          }}
        >
          Drag and drop assignments into their appropriate categories. All
          assignments must be categorized before proceeding.
        </Alert>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {/* Categories section */}
            <Stack spacing={2}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AssignmentIcon />
                Categories
              </Typography>

              {categories.map((category, index) => (
                <Droppable
                  key={`category-${index}`}
                  droppableId={`category-${index}`}
                  type="assignment"
                  direction="vertical"
                  mode="standard"
                  isCombineEnabled={false}
                >
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: snapshot.isDraggingOver
                          ? "primary.main"
                          : "divider",
                        backgroundColor: snapshot.isDraggingOver
                          ? alpha("#2196f3", 0.08)
                          : "background.paper",
                        minHeight: 100,
                        transition: "background-color 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 500, color: "text.secondary", mb: 2 }}
                      >
                        {category.name} ({category.weight}%)
                      </Typography>

                      <Stack spacing={1}>
                        {(category.assignments || []).map(
                          (assignment, assignmentIndex) => (
                            <Draggable
                              key={`${category.name}-${assignment.name}-${assignmentIndex}`}
                              draggableId={`${category.name}-${assignment.name}-${assignmentIndex}`}
                              index={assignmentIndex}
                            >
                              {(provided, snapshot) => (
                                <Paper
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  elevation={snapshot.isDragging ? 3 : 1}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: snapshot.isDragging
                                      ? alpha("#2196f3", 0.08)
                                      : "background.paper",
                                    border: "1px solid",
                                    borderColor: snapshot.isDragging
                                      ? "primary.main"
                                      : "divider",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    transition:
                                      "transform 0.2s ease, box-shadow 0.2s ease",
                                    "&:hover": {
                                      transform: "translateY(-2px)",
                                      boxShadow: 2,
                                    },
                                  }}
                                >
                                  <DragIndicatorIcon
                                    sx={{ color: "text.secondary" }}
                                  />
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 500 }}
                                    >
                                      {assignment.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Score: {assignment.score}/
                                      {assignment.total_points}
                                    </Typography>
                                  </Box>
                                </Paper>
                              )}
                            </Draggable>
                          )
                        )}
                        {provided.placeholder}
                      </Stack>
                    </Paper>
                  )}
                </Droppable>
              ))}
            </Stack>

            {/* Uncategorized section */}
            <Stack spacing={2}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AssignmentIcon />
                Uncategorized Assignments ({uncategorizedAssignments.length})
              </Typography>

              <Droppable
                droppableId="uncategorized"
                type="assignment"
                direction="vertical"
                mode="standard"
                isCombineEnabled={false}
              >
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: snapshot.isDraggingOver
                        ? "warning.main"
                        : "divider",
                      backgroundColor: snapshot.isDraggingOver
                        ? alpha("#ff9800", 0.08)
                        : "background.paper",
                      minHeight: 100,
                      transition: "background-color 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <Stack spacing={1}>
                      {uncategorizedAssignments.map((assignment, index) => (
                        <Draggable
                          key={`uncategorized-${assignment.name}-${index}`}
                          draggableId={`uncategorized-${assignment.name}-${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              elevation={snapshot.isDragging ? 3 : 1}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: snapshot.isDragging
                                  ? alpha("#ff9800", 0.08)
                                  : "background.paper",
                                border: "1px solid",
                                borderColor: snapshot.isDragging
                                  ? "warning.main"
                                  : "divider",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                transition:
                                  "transform 0.2s ease, box-shadow 0.2s ease",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: 2,
                                },
                              }}
                            >
                              <DragIndicatorIcon
                                sx={{ color: "text.secondary" }}
                              />
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {assignment.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Score: {assignment.score}/
                                  {assignment.total_points}
                                </Typography>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Stack>
                  </Paper>
                )}
              </Droppable>
            </Stack>
          </Box>
        </DragDropContext>
      </Stack>
    </Paper>
  );
};

export default CategoryReview;
