import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Paper, Typography, Alert, Box } from "@mui/material";

const CategoryReview = ({
  parsedGrades,
  uncategorizedAssignments,
  categories,
  handleDragEnd,
}) => {
  if (!parsedGrades || !uncategorizedAssignments) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="error">
          No grade data available. Please go back and input your grades.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Review and Categorize Assignments
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Drag and drop assignments into their appropriate categories. All
        assignments must be categorized before proceeding.
      </Alert>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {/* Categories section */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Categories
            </Typography>
            {categories.map((category, index) => (
              <Droppable
                key={`category-${index}`}
                droppableId={`category-${index}`}
              >
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      p: 2,
                      mb: 2,
                      minHeight: 100,
                      backgroundColor: snapshot.isDraggingOver
                        ? "action.hover"
                        : "background.paper",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {category.name} ({category.weight}%)
                    </Typography>
                    {(category.assignments || []).map(
                      (assignment, assignmentIndex) => (
                        <Draggable
                          key={`category-${index}-assignment-${assignmentIndex}`}
                          draggableId={`category-${index}-assignment-${assignmentIndex}`}
                          index={assignmentIndex}
                        >
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              elevation={snapshot.isDragging ? 6 : 1}
                              sx={{
                                p: 1,
                                mb: 1,
                                backgroundColor: snapshot.isDragging
                                  ? "grey.100"
                                  : "background.paper",
                                "&:hover": { backgroundColor: "grey.50" },
                              }}
                            >
                              <Typography variant="body2">
                                {assignment.name} ({assignment.score}/
                                {assignment.total_points})
                              </Typography>
                            </Paper>
                          )}
                        </Draggable>
                      )
                    )}
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            ))}
          </Box>

          {/* Uncategorized section */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Uncategorized Assignments ({uncategorizedAssignments.length})
            </Typography>
            <Droppable droppableId="uncategorized">
              {(provided, snapshot) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    p: 2,
                    minHeight: 100,
                    backgroundColor: snapshot.isDraggingOver
                      ? "action.hover"
                      : "background.paper",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {uncategorizedAssignments.map((assignment, index) => (
                    <Draggable
                      key={`uncategorized-${index}`}
                      draggableId={`uncategorized-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          elevation={snapshot.isDragging ? 6 : 1}
                          sx={{
                            p: 1,
                            mb: 1,
                            backgroundColor: snapshot.isDragging
                              ? "grey.100"
                              : "background.paper",
                            "&:hover": { backgroundColor: "grey.50" },
                          }}
                        >
                          <Typography variant="body2">
                            {assignment.name} ({assignment.score}/
                            {assignment.total_points})
                          </Typography>
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Paper>
              )}
            </Droppable>
          </Box>
        </Box>
      </DragDropContext>
    </Paper>
  );
};

export default CategoryReview;
