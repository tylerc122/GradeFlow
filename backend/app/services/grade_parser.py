from datetime import datetime
from typing import List, Optional, Tuple
from ..models.grade_models import Assignment
from .category_matcher import CategoryMatcher
from .openai_integration import OpenAICategorizer
from .shared_services import openai_categorizer
import re

# Remove this local instance
# openai_categorizer = OpenAICategorizer()

async def parse_blackboard_grades(raw_text: str, available_categories: Optional[List[str]] = None) -> list[Assignment]:
    assignments = []
    pending_openai = []  # Store assignments that need OpenAI categorization
    
    # Initialize categorizers
    category_matcher = CategoryMatcher(available_categories=available_categories)
    # Using the shared instance from shared_services
    
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
            suggested_category=None,
            category_confidence=0.0,
            match_reasons=category_match.match_reasons
        )
        
        # If rule-based categorization is confident enough (>= 0.5), use it
        if category_match.confidence >= 0.5:
            assignment.suggested_category = category_match.category
            assignment.category_confidence = category_match.confidence
            assignment.match_reasons = category_match.match_reasons
            assignments.append(assignment)
            print(f"Rule-based categorization successful for: {name}")
            
        # If not confident enough, add to pending for OpenAI
        elif available_categories:
            pending_assignments.append((assignment, (name, assignment_type)))
        else:
            # If no OpenAI fallback available, use rule-based anyway but with low confidence
            assignment.suggested_category = category_match.category
            assignment.category_confidence = category_match.confidence
            assignment.match_reasons = category_match.match_reasons
            assignments.append(assignment)

    # Process pending assignments with OpenAI in batches
    if pending_assignments:
        batch_size = 5
        for i in range(0, len(pending_assignments), batch_size):
            batch = pending_assignments[i:i + batch_size]
            batch_inputs = [info for _, info in batch]
            try:
                # Use the shared instance for caching benefits
                results = await openai_categorizer.suggest_categories_batch(
                    batch_inputs, 
                    available_categories
                )
                
                # Update assignments with OpenAI results
                for (assignment, _), (category, confidence, reasons) in zip(batch, results):
                    # Only use OpenAI's suggestion if it's confident (>= 0.7)
                    if confidence >= 0.7:
                        assignment.suggested_category = category
                        assignment.category_confidence = confidence
                        assignment.match_reasons = ["openai:" + reason for reason in reasons]
                    else:
                        # If OpenAI isn't confident, don't suggest any category
                        assignment.suggested_category = None
                        assignment.category_confidence = 0.0
                        assignment.match_reasons = ["low_confidence:both_methods_uncertain"]
                    
                    assignments.append(assignment)
                    print(f"Processed assignment: {assignment.name} (OpenAI confidence: {confidence})")
                    
            except Exception as e:
                print(f"OpenAI categorization failed: {str(e)}")
                # Fall back to rule-based results
                for assignment, _ in batch:
                    category_match = category_matcher.match_category(
                        assignment.name, 
                        assignment.assignment_type
                    )
                    assignment.suggested_category = category_match.category
                    assignment.category_confidence = category_match.confidence
                    assignment.match_reasons = ["fallback:" + reason for reason in category_match.match_reasons]
                    assignments.append(assignment)
                    print(f"Fallback categorization for: {assignment.name}")

    return assignments