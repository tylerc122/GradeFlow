from datetime import datetime
from typing import List, Optional
from ..models.grade_models import Assignment
from .category_matcher import CategoryMatcher
import re

def parse_blackboard_grades(raw_text: str, available_categories: Optional[List[str]] = None) -> list[Assignment]:
    assignments = []
    
    # Log available categories
    print("Available categories for matching:", available_categories)
    
    category_matcher = CategoryMatcher(available_categories=available_categories)
    
    # Clean up the text - normalize newlines and remove extra spaces
    clean_text = '\n'.join(line.strip() for line in raw_text.splitlines() if line.strip())
    
    # Create pattern to match assignment blocks
    pattern = re.compile(
        r'(?P<name>[^\n]+)\n'  # Assignment name
        r'(?:Test\n)?'  # Optional Test type
        r'(?:[^\n]+(?:AM|PM)[^\n]*\n)?'  # Optional date line
        r'(?P<status>Graded|Upcoming)\n'  # Status
        r'(?P<score>[0-9.-]+)\n'  # Score (number or -)
        r'/(?P<total>[0-9.]+)'  # Total points
    )
    
    # Find all matches
    for match in pattern.finditer(clean_text):
        name = match.group('name').strip()
        
        # Skip if it's just metadata
        if name in ['Test', 'Assignment', 'Graded', 'Upcoming']:
            continue
            
        status = 'GRADED' if match.group('status') == 'Graded' else 'UPCOMING'
        
        # Handle score
        score = 0.0
        if match.group('score') != '-':
            try:
                score = float(match.group('score'))
            except ValueError:
                print(f"Error parsing score for {name}")
                continue
        
        # Handle total points
        try:
            total_points = float(match.group('total'))
        except ValueError:
            print(f"Error parsing total points for {name}")
            continue
        
        # Check if it's a test type
        lines_before_status = clean_text[:match.start('status')].split('\n')
        assignment_type = None
        if len(lines_before_status) >= 2 and 'Test' in lines_before_status[-2]:
            assignment_type = 'Test'
        
        # Get category suggestion with logging
        print(f"\nAttempting to match category for: {name}")
        category_match = category_matcher.match_category(name, assignment_type)
        print(f"Match result: {category_match.category} (confidence: {category_match.confidence})")
        print(f"Match reasons: {category_match.match_reasons}")
        
        assignment = Assignment(
            name=name,
            assignment_type=assignment_type,
            date_graded=None,
            status=status,
            score=score,
            total_points=total_points,
            suggested_category=category_match.category,
            category_confidence=category_match.confidence,
            match_reasons=category_match.match_reasons
        )
        
        assignments.append(assignment)
        print(f"Successfully added assignment: {name}")
    
    print(f"\nTotal assignments parsed: {len(assignments)}")
    return assignments