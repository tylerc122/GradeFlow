from dataclasses import dataclass
from typing import List, Dict, Optional, Set
import re

@dataclass
class CategoryMatch:
    """Represents a potential category match for an assignment"""
    category: str
    confidence: float  # 0-1
    match_reasons: List[str]

@dataclass
class CategoryPattern:
    """Defines patterns for a category"""
    prefixes: List[str]
    keywords: List[str]
    assignment_types: List[str]
    compound_patterns: Optional[List[str]] = None
    negative_patterns: Optional[List[str]] = None

class CategoryMatcher:
    def __init__(self, available_categories: Optional[List[str]] = None):
        """
        Initialize with default patterns but optionally restrict to available categories
        
        Args:
            available_categories: List of category names that are valid for this course
        """
        self.available_categories = {cat.lower() for cat in available_categories} if available_categories else None
        
        # Initialize with default patterns
        self.category_patterns: Dict[str, CategoryPattern] = {
            "Quiz": CategoryPattern(
                prefixes=["quiz", "qz"],
                keywords=["quiz", "quizzes", "test"],
                assignment_types=["Quiz", "Test"],
                compound_patterns=[r'quiz\s*\d+', r'quiz\d+', r'q\d+'],
                negative_patterns=[r'lab\s*quiz', r'quiz\s*retake']
            ),
            "Homework": CategoryPattern(
                prefixes=["hw", "homework"],
                keywords=["homework", "assignment"],
                assignment_types=["Assignment"],
                compound_patterns=[
                    r'homework\s*\d+',
                    r'hw\s*\d+',
                    r'^hw\d+',
                    r'hw\d+[._](?:required|extra|milestone|m\d+)'
                ],
                negative_patterns=[r'lab', r'project']
            ),
            "Lab": CategoryPattern(
                prefixes=["lab"],
                keywords=["lab", "laboratory", "ilab"],
                assignment_types=["Lab", "Assignment"],
                compound_patterns=[
                    r'lab\s*\d+',
                    r'lab_\d+',
                    r'lab\s*participation',
                    r'ilab\s*participation'
                ]
            ),
            "Participation": CategoryPattern(
                prefixes=["participation", "attend"],
                keywords=[
                    "participation",
                    "attendance",
                    "lecture_participation",
                    "class participation",
                    "ed_participation",
                    "guest lecture"
                ],
                assignment_types=["Participation", "Test"],
                compound_patterns=[
                    r'lecture_part',
                    r'class\s*participation',
                    r'lecture_participation'
                ]
            ),
            "Project": CategoryPattern(
                prefixes=["project", "proj"],
                keywords=["project", "final project"],
                assignment_types=["Assignment"],
                compound_patterns=[r'project\s*\d+', r'proj\s*\d+']
            ),
            "Exercise": CategoryPattern(
                prefixes=["exercise"],
                keywords=["exercise", "inclass-exercise", "in-class"],
                assignment_types=["Assignment"],
                compound_patterns=[r'exercise\s*\d+', r'inclass-exercise-\d+']
            )
        }
        
        # Compile regex patterns
        self.number_pattern = re.compile(r'[0-9]+')
        self.separator_pattern = re.compile(r'[-_\s]+')

    def normalize_text(self, text: str) -> str:
        """Normalize text for pattern matching"""
        text = text.lower().strip()
        text = self.separator_pattern.sub(' ', text)
        return text

    def match_category(self, 
                      assignment_name: str, 
                      assignment_type: Optional[str] = None) -> CategoryMatch:
        """
        Match an assignment to an available category with refined confidence scoring:
        - Base confidence starts at 0.3 for any match
        - Assignment type match: +0.3
        - Compound pattern match: +0.4
        - Exact prefix match: +0.3
        - Keyword match: +0.2
        - Negative pattern match: -0.4
        """
        best_match = CategoryMatch(
            category="Uncategorized",
            confidence=0.0,
            match_reasons=[]
        )
        
        # Only match against available categories if specified
        patterns_to_check = {}
        for category, pattern in self.category_patterns.items():
            if (self.available_categories is None or 
                category.lower() in self.available_categories):
                patterns_to_check[category] = pattern
        
        normalized_name = self.normalize_text(assignment_name)
        words = normalized_name.split()
        
        for category, patterns in patterns_to_check.items():
            confidence = 0.0
            reasons = []
            
            # Check assignment type match
            if assignment_type and assignment_type in patterns.assignment_types:
                confidence += 0.3
                reasons.append(f"assignment_type_match:{assignment_type}")
            
            # Check compound patterns
            if patterns.compound_patterns:
                for pattern in patterns.compound_patterns:
                    if re.search(pattern, normalized_name):
                        confidence = max(confidence + 0.4, 0.7)
                        reasons.append(f"compound_pattern_match:{pattern}")
                        break
            
            # Check prefix matches
            for prefix in patterns.prefixes:
                if any(word.startswith(prefix) for word in words):
                    confidence += 0.3
                    reasons.append(f"prefix_match:{prefix}")
                    break
            
            # Check keyword matches
            for keyword in patterns.keywords:
                if keyword in normalized_name:
                    confidence += 0.2
                    reasons.append(f"keyword_match:{keyword}")
            
            # Check negative patterns
            if patterns.negative_patterns:
                for pattern in patterns.negative_patterns:
                    if re.search(pattern, normalized_name):
                        confidence = max(0, confidence - 0.4)
                        reasons.append(f"negative_pattern_match:{pattern}")

            # Start with base confidence for any match
            if confidence > 0:
                confidence = 0.3 + (confidence * 0.7)  # Scale remaining confidence
            
            # Normalize confidence to 0-1 range
            confidence = min(confidence, 1.0)
            
            # Update best match if confidence is higher
            if confidence > best_match.confidence:
                best_match = CategoryMatch(
                    category=category,
                    confidence=confidence,
                    match_reasons=reasons
                )
        
        return best_match

    def add_pattern(self, category: str, pattern: CategoryPattern) -> None:
        """Add or update a category pattern"""
        self.category_patterns[category] = pattern

    def remove_pattern(self, category: str) -> None:
        """Remove a category pattern"""
        if category in self.category_patterns:
            del self.category_patterns[category]