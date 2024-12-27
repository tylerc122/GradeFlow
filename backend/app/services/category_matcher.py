from dataclasses import dataclass
from typing import List, Dict, Optional
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

class CategoryMatcher:
    def __init__(self):
        # Initialize with default academic patterns
        self.category_patterns: Dict[str, CategoryPattern] = {
            "Quiz": CategoryPattern(
                prefixes=["quiz", "qz", "q"],
                keywords=["quiz", "quizzes"],
                assignment_types=["Quiz"]
            ),
            "Homework": CategoryPattern(
                prefixes=["hw", "homework", "assignment"],
                keywords=["homework", "assignment", "project"],
                assignment_types=["Homework", "Assignment"]
            ),
            "Test": CategoryPattern(
                prefixes=["test", "exam", "midterm", "final"],
                keywords=["test", "exam", "midterm", "final"],
                assignment_types=["Test", "Exam"]
            ),
            "Lab": CategoryPattern(
                prefixes=["lab", "laboratory"],
                keywords=["lab", "laboratory", "practical"],
                assignment_types=["Lab", "Laboratory"]
            ),
            "Participation": CategoryPattern(
                prefixes=["participation", "attend"],
                keywords=["participation", "attendance", "discussion"],
                assignment_types=["Participation", "Attendance"]
            )
        }
        
        # Compile regex patterns for common variations
        self.number_pattern = re.compile(r'[0-9]+')
        self.separator_pattern = re.compile(r'[-_\s]+')

    def normalize_text(self, text: str) -> str:
        """Normalize text for pattern matching"""
        # Convert to lowercase and remove extra whitespace
        text = text.lower().strip()
        # Replace common separators with spaces
        text = self.separator_pattern.sub(' ', text)
        return text

    def match_category(self, 
                      assignment_name: str, 
                      assignment_type: Optional[str] = None) -> CategoryMatch:
        """
        Match an assignment to a category based on its name and type.
        Returns the best matching category with confidence score.
        """
        best_match = CategoryMatch(
            category="Uncategorized",
            confidence=0.0,
            match_reasons=[]
        )
        
        normalized_name = self.normalize_text(assignment_name)
        words = normalized_name.split()
        
        for category, patterns in self.category_patterns.items():
            confidence = 0.0
            reasons = []
            
            # Check assignment type match (highest confidence)
            if assignment_type and assignment_type in patterns.assignment_types:
                confidence += 0.8
                reasons.append(f"assignment_type_match:{assignment_type}")
            
            # Check prefix matches
            for prefix in patterns.prefixes:
                if any(word.startswith(prefix) for word in words):
                    confidence += 0.6
                    reasons.append(f"prefix_match:{prefix}")
                    break
            
            # Check keyword matches
            for keyword in patterns.keywords:
                if keyword in normalized_name:
                    confidence += 0.4
                    reasons.append(f"keyword_match:{keyword}")
            
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