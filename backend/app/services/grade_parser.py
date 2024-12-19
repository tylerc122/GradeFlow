from datetime import datetime
from ..models.grade_models import Assignment
import re

def parse_blackboard_grades(raw_text: str) -> list[Assignment]:
    assignments = []
    
    # First clean up the text - normalize newlines and remove extra spaces
    clean_text = '\n'.join(line.strip() for line in raw_text.splitlines() if line.strip())
    
    # Create a regex pattern to match assignment blocks
    assignment_pattern = re.compile(
        r'(?P<name>[^\n]+)\n'  # Assignment name
        r'(?:Test\n)?'  # Optional Test type
        r'(?:[^\n]+\n)?'  # Date line (optional)
        r'(?P<status>Graded|Upcoming)\n'  # Status
        r'(?P<score>(?:\d+\.\d+|-)?)\n'  # Score (or '-' for upcoming)
        r'/(?P<total>\d+)'  # Total points
    )
    
    # Find all matches
    for match in assignment_pattern.finditer(clean_text):
        name = match.group('name')
        status = 'GRADED' if match.group('status') == 'Graded' else 'UPCOMING'
        
        # Handle score
        score = 0.0
        if match.group('score') and match.group('score') != '-':
            try:
                score = float(match.group('score'))
            except ValueError:
                continue
        
        # Handle total points
        try:
            total_points = float(match.group('total'))
        except ValueError:
            continue
            
        # Check if it's a test type
        assignment_type = None
        lines_before_status = clean_text[:match.start('status')].split('\n')
        if len(lines_before_status) >= 2 and 'Test' in lines_before_status[-2]:
            assignment_type = 'Test'
        
        assignments.append(Assignment(
            name=name,
            assignment_type=assignment_type,
            date_graded=None,
            status=status,
            score=score,
            total_points=total_points
        ))
    
    return assignments