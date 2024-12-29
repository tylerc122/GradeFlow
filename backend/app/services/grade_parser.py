from datetime import datetime
from typing import List, Optional, Tuple
from ..models.grade_models import Assignment
from .category_matcher import CategoryMatcher
from .openai_integration import OpenAICategorizer
import re

async def parse_blackboard_grades(raw_text: str, available_categories: Optional[List[str]] = None) -> list[Assignment]:
    assignments = []
    pending_openai = []  # Store assignments that need OpenAI categorization
    
    # Initialize categorizers
    category_matcher = CategoryMatcher(available_categories=available_categories)
    openai_categorizer = OpenAICategorizer()
    
    # Clean up the text - normalize newlines and remove extra spaces
    clean_text = '\n'.join(line.strip() for line in raw_text.splitlines() if line.strip())
    
    # Create pattern to match assignment blocks
    # Create pattern to match assignment blocks with all possible variations
    pattern = re.compile(
        # Name can contain any characters
        r'(?P<name>[^\n]+)\n'
        # Optional due date line
        r'(?:Due:[^\n]+\n)?'
        # Optional assignment type - make it optional and capture it if present
        r'(?:(?P<type>Assignment|Discussion|Test|Blog|Quiz|Exam)\n)?'
        # Optional date line with flexible format
        r'(?:[A-Za-z]+ \d{1,2}, \d{4}(?:[^\n]*(?:AM|PM))?\n)?'
        # Status line
        r'(?P<status>Graded|Upcoming)\n'
        # Score line - handle optional spaces and dashes
        r'(?P<score>\s*-|\s*[0-9.]+)\n'
        # Total points
        r'/(?P<total>[0-9.]+)',
        re.MULTILINE
    )
    
    # First pass: Parse all assignments and attempt rule-based categorization
    pending_assignments = []
    for match in pattern.finditer(clean_text):
        name = match.group('name').strip()
        
        # Skip if it's just metadata
        if name in ['Test', 'Assignment', 'Graded', 'Upcoming']:
            continue
            
        status = 'GRADED' if match.group('status') == 'Graded' else 'UPCOMING' # I'm like 99 % sure that there's only graded/upcoming, should be fine
        
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
        
        # Try rule-based categorization first
        category_match = category_matcher.match_category(name, assignment_type)
        
        # Create assignment object
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
        
        # If rule-based confidence is low, add to pending OpenAI batch
        if available_categories and OpenAICategorizer.should_use_openai(category_match.confidence):
            pending_assignments.append((assignment, (name, assignment_type)))
        else:
            assignments.append(assignment)
            print(f"Successfully added assignment: {name}")

    # Process pending assignments in batches
    if pending_assignments:
        batch_size = 5
        for i in range(0, len(pending_assignments), batch_size):
            batch = pending_assignments[i:i + batch_size]
            batch_inputs = [info for _, info in batch]
            try:
                results = await openai_categorizer.suggest_categories_batch(batch_inputs, available_categories)
                
                # Update assignments with OpenAI results
                for (assignment, _), (category, confidence, reasons) in zip(batch, results):
                    if category and confidence > assignment.category_confidence:
                        assignment.suggested_category = category
                        assignment.category_confidence = confidence
                        assignment.match_reasons = reasons
                    assignments.append(assignment)
                    print(f"Successfully added assignment: {assignment.name}")
                    
            except Exception as e:
                print(f"OpenAI categorization failed: {str(e)}")
                # Fall back to rule-based results
                for assignment, _ in batch:
                    assignments.append(assignment)
                    print(f"Successfully added assignment: {assignment.name} (fallback)")

    print(f"\nTotal assignments parsed: {len(assignments)}")
    return assignments