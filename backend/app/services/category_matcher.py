from dataclasses import dataclass
from typing import List, Dict, Optional, Set
import re

@dataclass
class CategoryPattern:
    """Defines patterns for a category"""
    prefixes: List[str]
    keywords: List[str]
    assignment_types: List[str]
    compound_patterns: Optional[List[str]] = None
    negative_patterns: Optional[List[str]] = None

@dataclass
class CategoryMatch:
    """Represents a potential category match for an assignment"""
    category: str
    confidence: float  # 0-1
    match_reasons: List[str]

class CategoryMatcher:
    def __init__(self, available_categories: Optional[List[str]] = None):
        """Initialize with default patterns but optionally restrict to available categories"""
        self.available_categories = {cat.lower() for cat in available_categories} if available_categories else None
        
        # Initialize with improved patterns
        self.category_patterns: Dict[str, CategoryPattern] = {
            "Homework": CategoryPattern(
                prefixes=["hw", "homework", "h"],
                keywords=["homework", "assignment", "milestone", "required", "extra"],
                assignment_types=["Assignment"],
                compound_patterns=[
                    r'(?i)homework\s*\d+',
                    r'(?i)hw\s*\d+',
                    r'(?i)^hw\d+',
                    r'(?i)hw[0-9.]+[._](?:required|extra|milestone|m\d+)',
                    r'(?i)^h[0-9.]+',
                    r'(?i)homework[0-9]+',
                    r'(?i)^homework\s+[0-9]+$'
                ],
                negative_patterns=[r'lab', r'project']
            ),
            "Quizzes": CategoryPattern(
                prefixes=["quiz", "qz", "q", "test"],
                keywords=["quiz", "quizzes", "test", "assessment", "exam"],
                assignment_types=["Quiz", "Test", "Assessment"],
                compound_patterns=[
                    r'(?i)quiz\s*\d+',
                    r'(?i)quiz\d+',
                    r'(?i)q\d+',
                    r'(?i)^quiz\s+[0-9]+$',
                    r'(?i)^q[0-9]+$',
                    r'(?i)test\s*\d+',
                    r'(?i)assessment\s*\d+',
                    r'(?i)exam\s*\d+'
                ],
                negative_patterns=[
                    r'(?i)lab\s*quiz',
                    r'(?i)quiz\s*retake',
                    r'(?i)practice[\s-]*quiz',
                    r'(?i)sample[\s-]*quiz'
                ]
            ),
            "Participation": CategoryPattern(
                prefixes=["participation", "attend", "guest", "lecture", "inclass", "in-class"],
                keywords=[
                    "participation",
                    "attendance",
                    "lecture_participation",
                    "class participation",
                    "ed_participation",
                    "guest lecture",
                    "lecture",
                    "exercise",
                    "in-class",
                    "inclass"
                ],
                assignment_types=["Participation", "Test", "Discussion"],
                compound_patterns=[
                    r'(?i)lecture[_-]part',
                    r'(?i)class\s*participation',
                    r'(?i)lecture[_-]participation',
                    r'(?i)guest[_-]lecture',
                    r'(?i)in-?class[_-]exercise[_-]?\d*',
                    r'(?i)inclass[_-]exercise[_-]?\d*'
                ]
            )
        }
        
        # Map category aliases
        self.category_aliases = {
            "Quiz": "Quizzes",
            "Tests": "Quizzes",
            "Assignments": "Homework",
            "HW": "Homework",
            "Exercise": "Participation",
            "Exercises": "Participation",
            "Attend": "Participation",
            "Attendance": "Participation"
        }
        
        # Compile regex patterns
        self.number_pattern = re.compile(r'[0-9]+')
        self.separator_pattern = re.compile(r'[-_\s]+')

    def normalize_text(self, text: str) -> str:
        """Normalize text for pattern matching"""
        text = text.lower().strip()
        text = self.separator_pattern.sub(' ', text)
        return text
        
    def get_canonical_category(self, category: str) -> str:
        """Get the canonical category name, handling aliases"""
        return self.category_aliases.get(category, category)

    def match_category(self, 
                      assignment_name: str, 
                      assignment_type: Optional[str] = None) -> CategoryMatch:
        """
        Match an assignment to an available category with refined confidence scoring
        """
        print(f"\n=== Debug Categorization for: {assignment_name} ===")
        print(f"Assignment type: {assignment_type}")
        
        best_match = CategoryMatch(
            category="Uncategorized",
            confidence=0.0,
            match_reasons=[]
        )
        
        # Only match against available categories if specified
        patterns_to_check = {}
        for category, pattern in self.category_patterns.items():
            canonical_category = self.get_canonical_category(category)
            if (self.available_categories is None or 
                canonical_category.lower() in self.available_categories):
                patterns_to_check[canonical_category] = pattern
        
        print(f"Available categories to check: {list(patterns_to_check.keys())}")
        
        normalized_name = self.normalize_text(assignment_name)
        words = normalized_name.split()
        print(f"Normalized name: {normalized_name}")
        print(f"Words: {words}")
        
        for category, patterns in patterns_to_check.items():
            print(f"\nChecking category: {category}")
            confidence = 0.0
            reasons = []
            
            # Check assignment type match (high confidence)
            if assignment_type and assignment_type in patterns.assignment_types:
                confidence += 0.4
                reasons.append(f"assignment_type_match:{assignment_type}")
                print(f"Type match found: +0.4 confidence")
            
            # Check compound patterns (highest confidence)
            if patterns.compound_patterns:
                for pattern in patterns.compound_patterns:
                    if re.search(pattern, normalized_name):
                        old_confidence = confidence
                        confidence = max(confidence + 0.5, 0.8)
                        reasons.append(f"compound_pattern_match:{pattern}")
                        print(f"Compound pattern match '{pattern}': +{confidence - old_confidence} confidence")
                        break
            
            # Check prefix matches
            for prefix in patterns.prefixes:
                if any(word.startswith(prefix) for word in words):
                    confidence += 0.3
                    reasons.append(f"prefix_match:{prefix}")
                    print(f"Prefix match '{prefix}': +0.3 confidence")
                    break
            
            # Check keyword matches
            for keyword in patterns.keywords:
                if keyword in normalized_name:
                    confidence += 0.2
                    reasons.append(f"keyword_match:{keyword}")
                    print(f"Keyword match '{keyword}': +0.2 confidence")
            
            # Check negative patterns
            if patterns.negative_patterns:
                for pattern in patterns.negative_patterns:
                    if re.search(pattern, normalized_name):
                        old_confidence = confidence
                        confidence = max(0, confidence - 0.4)
                        reasons.append(f"negative_pattern_match:{pattern}")
                        print(f"Negative pattern match '{pattern}': -{old_confidence - confidence} confidence")

            # Add small base confidence for any match
            if confidence > 0:
                old_confidence = confidence
                confidence = 0.3 + (confidence * 0.7)
                print(f"Adjusting final confidence: {old_confidence} -> {confidence}")
            
            # Normalize confidence to 0-1 range
            confidence = min(confidence, 1.0)
            
            print(f"Final confidence for {category}: {confidence}")
            
            # Update best match if confidence is higher
            if confidence > best_match.confidence:
                print(f"New best match: {category} (confidence: {confidence})")
                best_match = CategoryMatch(
                    category=category,
                    confidence=confidence,
                    match_reasons=reasons
                )
        
        print(f"\nFinal categorization: {best_match.category} with confidence {best_match.confidence}")
        print(f"Reasons: {best_match.match_reasons}")
        return best_match