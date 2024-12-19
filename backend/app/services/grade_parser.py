from datetime import datetime
from ..models.grade_models import Assignment
import re

def parse_blackboard_grades(raw_text: str) -> list[Assignment]:
    # Split into individual assignments based on double newlines
    assignments_raw = [x.strip() for x in raw_text.split('\n\n') if x.strip()]
    assignments = []
    
    current_assignment = None
    for block in assignments_raw:
        lines = [line.strip() for line in block.split('\n') if line.strip()]
        
        if len(lines) >= 3:  # Minimum lines needed for an assignment
            name = lines[0]
            
            # Parse the rest of the assignment data
            for i in range(len(lines)):
                if "GRADED" in lines[i] or "UPCOMING" in lines[i]:
                    status = lines[i]
                    
                    # Try to get score and total points
                    try:
                        if i + 1 < len(lines) and i + 2 < len(lines):
                            score = float(lines[i + 1]) if lines[i + 1] != '-' else 0.0
                            total_points = float(lines[i + 2].strip('/')) if lines[i + 2] != '-' else 0.0
                            
                            # Try to parse date
                            date_graded = None
                            if i > 0:
                                try:
                                    date_str = lines[i-1].split(' ', 1)[0]  # Get date part
                                    date_graded = datetime.strptime(date_str, '%b %d, %Y')
                                except (ValueError, IndexError):
                                    pass
                            
                            # Handle assignment type
                            assignment_type = None
                            if len(lines) > 1 and lines[1] == "Test":
                                assignment_type = "Test"
                            
                            assignments.append(Assignment(
                                name=name,
                                assignment_type=assignment_type,
                                date_graded=date_graded,
                                status=status,
                                score=score,
                                total_points=total_points
                            ))
                            break
                    except (ValueError, IndexError):
                        continue
    
    return assignments