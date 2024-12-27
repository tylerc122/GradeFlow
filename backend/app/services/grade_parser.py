from datetime import datetime
from typing import List
from ..models.grade_models import Assignment
from .category_matcher import CategoryMatcher, CategoryMatch  # Added CategoryMatch import
import re

def parse_blackboard_grades(raw_text: str) -> list[Assignment]:
    assignments = []
    category_matcher = CategoryMatcher()
    
    # Clean up the text - normalize newlines
    clean_text = '\n'.join(line.strip() for line in raw_text.splitlines() if line.strip())
    
    # Create pattern to match assignment blocks
    # Updated pattern to properly handle assignment names and due dates
    pattern = re.compile(
        r'(?P<name>[^\n]+)\n'  # Assignment name
        r'(?:Due: [^\n]+\n)?'  # Optional due date
        r'(?P<type>Assignment|Test)\n'  # Assignment type
        r'(?:[^\n]+(?:AM|PM)[^\n]*\n)?'  # Date graded line
        r'(?P<status>Graded|Upcoming)\n'  # Status
        r'(?P<score>[0-9.-]+)\n'  # Score (number or -)
        r'/(?P<total>[0-9.]+)'  # Total points
    )
    
    # Find all matches
    for match in pattern.finditer(clean_text):
        # Get the real assignment name (before "Due:")
        name = match.group('name').strip()
        assignment_type = match.group('type')
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
        
        # Get category suggestion
        category_match = category_matcher.match_category(name, assignment_type)
        print(f"Category suggestion for {name}: {category_match.category} (confidence: {category_match.confidence})")
        
        # Handle special cases like "lab participation" and "lecture participation"
        if any(term in name.lower() for term in ['participation', 'survey']):
            category_match = CategoryMatch(
                category="Participation",
                confidence=1.0,
                match_reasons=["keyword_match:participation"]
            )
        
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