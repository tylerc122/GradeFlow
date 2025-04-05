from dataclasses import dataclass
from typing import List, Dict, Optional, Set
import re

@dataclass
class CategoryMatch:
    """Represents a potential category match for an assignment"""
    category: str
    confidence: float  # 0-1 confidence score
    match_reasons: List[str]

@dataclass
class CategoryPattern:
    """Defines patterns for a category"""
    prefixes: List[str]
    keywords: List[str]
    assignment_types: List[str]
    compound_patterns: Optional[List[str]] = None
    negative_patterns: Optional[List[str]] = None
    minimum_confidence: float = 0.3  # Minimum confidence threshold for this category
    is_compound_category: bool = False  # Whether this is a compound category (e.g., "Lab/Lecture")
    compound_components: Optional[List[str]] = None  # For compound categories, list of component words

class CategoryMatcher:
    def __init__(self, available_categories: Optional[List[str]] = None):
        self.available_categories = {cat.lower() for cat in available_categories} if available_categories else None
        
        # Add compound category recognition
        self.compound_separator_pattern = re.compile(r'[/&+-]|\s+and\s+|\s+or\s+')
        
        self.category_patterns: Dict[str, CategoryPattern] = {
            "Lab Quizzes": CategoryPattern(
                prefixes=["lab", "laboratory"],
                keywords=["quiz", "test", "assessment", "lab", "laboratory"],
                assignment_types=["Quiz", "Lab Quiz", "Assessment"],
                compound_patterns=[
                    r'(?i)lab(?:oratory)?[\s/+-]*quiz(?:zes)?',
                    r'(?i)quiz(?:zes)?[\s/+-]*lab(?:oratory)?',
                    r'(?i)lab\s*\d+\s*quiz',
                    r'(?i)quiz\s*\d+\s*lab'
                ],
                negative_patterns=[
                    r'(?i)pre[\s-]*lab',
                    r'(?i)post[\s-]*lab',
                    r'(?i)lecture'
                ],
                is_compound_category=True,
                compound_components=["lab", "quiz"]
            ),
            
            "Labs": CategoryPattern(
                prefixes=["lab", "laboratory", "practical", "experiment"],
                keywords=["lab", "laboratory", "experiment", "practical", "procedure"],
                assignment_types=["Lab", "Laboratory", "Experiment", "Practical"],
                compound_patterns=[
                    r'(?i)lab\s*\d+',
                    r'(?i)laboratory\s*\d+',
                    r'(?i)experiment\s*\d+',
                    r'(?i)^lab\s+[0-9]+$',
                    r'(?i)[\s_-]lab[\s_-]report',
                    r'(?i)practical\s*\d+'
                ],
                negative_patterns=[
                    r'(?i)lab[\s_-]*quiz',
                    r'(?i)pre[\s_-]*lab',
                    r'(?i)post[\s_-]*lab'
                ]
            ),
            
            "Exams": CategoryPattern(
                prefixes=["final", "exam"],
                keywords=["final", "exam", "final exam"],
                assignment_types=["Final Exam", "Exam", "Final"],
                compound_patterns=[
                    r'(?i)final\s*exam',
                    r'(?i)exam\s*final',
                    r'(?i)^final$'
                ],
                negative_patterns=[
                    r'(?i)midterm',
                    r'(?i)practice',
                    r'(?i)sample'
                ],
                minimum_confidence=0.4
            ),
            
            "Presentations": CategoryPattern(
                prefixes=["presentation", "pres", "talk", "speech"],
                keywords=["presentation", "oral", "speech", "talk", "demo", "demonstration"],
                assignment_types=["Presentation", "Speech", "Oral", "Talk"],
                compound_patterns=[
                    r'(?i)presentation\s*\d*',
                    r'(?i)oral\s*presentation',
                    r'(?i)group\s*presentation',
                    r'(?i)[\s_-]presentation',
                    r'(?i)speech\s*\d+'
                ]
            ),
            
            "Discussion/Recitation": CategoryPattern(
                prefixes=["discussion", "recitation", "disc", "section"],
                keywords=["discussion", "recitation", "section", "seminar", "forum"],
                assignment_types=["Discussion", "Recitation", "Section"],
                compound_patterns=[
                    r'(?i)discussion\s*\d+',
                    r'(?i)disc\s*\d+',
                    r'(?i)recitation\s*\d+',
                    r'(?i)section\s*\d+',
                    r'(?i)[\s_-]discussion',
                    r'(?i)discussion[\s_-]board',
                    r'(?i)discussion[\s_-]post'
                ],
                is_compound_category=True,
                compound_components=["discussion", "recitation"]
            ),
            
            "Final Project/Capstone": CategoryPattern(
                prefixes=["final", "capstone", "culminating"],
                keywords=["final", "project", "capstone", "culminating", "thesis"],
                assignment_types=["Final Project", "Capstone", "Project"],
                compound_patterns=[
                    r'(?i)final\s*project',
                    r'(?i)capstone\s*project',
                    r'(?i)culminating\s*project',
                    r'(?i)senior\s*project',
                    r'(?i)thesis\s*project'
                ],
                negative_patterns=[
                    r'(?i)midterm',
                    r'(?i)practice',
                    r'(?i)sample'
                ],
                is_compound_category=True,
                compound_components=["final", "project"]
            ),
            
            "Group Work/Collaborative Assignments": CategoryPattern(
                prefixes=["group", "team", "collaborative", "peer"],
                keywords=["group", "team", "collaborative", "peer", "cooperation"],
                assignment_types=["Group", "Team", "Collaborative"],
                compound_patterns=[
                    r'(?i)group\s*(?:assignment|project|work)',
                    r'(?i)team\s*(?:assignment|project|work)',
                    r'(?i)collaborative\s*(?:assignment|project|work)',
                    r'(?i)peer\s*(?:assignment|project|work)'
                ],
                is_compound_category=True,
                compound_components=["group", "collaborative"]
            ),
            
            "Lecture/Lab Participation": CategoryPattern(
                prefixes=["lecture", "lab", "class"],
                keywords=[
                    "participation",
                    "attendance",
                    "engagement",
                    "lecture",
                    "laboratory",
                    "lab"
                ],
                assignment_types=["Participation", "Attendance"],
                compound_patterns=[
                    r'(?i)(?:lecture|lab|class)[\s/+-]*participation',
                    r'(?i)participation[\s/+-]*(?:lecture|lab|class)',
                    r'(?i)lecture[\s/+-]*lab[\s/+-]*participation',
                    r'(?i)lab[\s/+-]*lecture[\s/+-]*participation'
                ],
                is_compound_category=True,
                compound_components=["lecture", "lab", "participation"]
            ),
            
            "Homework": CategoryPattern(
                prefixes=["hw", "homework", "h", "assignment", "asgmt"],
                keywords=["homework", "assignment", "milestone", "required", "work"],
                assignment_types=["Assignment", "Homework"],
                compound_patterns=[
                    r'(?i)homework\s*\d+',
                    r'(?i)hw\s*\d+',
                    r'(?i)^hw\d+',
                    r'(?i)hw[0-9.]+[._](?:required|milestone|m\d+)',
                    r'(?i)^h[0-9.]+',
                    r'(?i)homework[0-9]+',
                    r'(?i)^homework\s+[0-9]+$'
                ],
                negative_patterns=[
                    r'(?i)lab',
                    r'(?i)project',
                    r'(?i)exam',
                    r'(?i)final',
                    r'(?i)quiz',
                    r'(?i)test',
                    r'(?i)extra',
                    r'(?i)bonus'
                ]
            ),
            
            "Quizzes": CategoryPattern(
                prefixes=["quiz", "qz", "q"],
                keywords=["quiz", "quizzes", "assessment"],
                assignment_types=["Quiz", "Assessment"],
                compound_patterns=[
                    r'(?i)quiz\s*\d+',
                    r'(?i)quiz\d+',
                    r'(?i)^q\d+',
                    r'(?i)^quiz\s+[0-9]+$',
                    r'(?i)^q[0-9]+$'
                ],
                negative_patterns=[
                    r'(?i)lab\s*quiz',
                    r'(?i)quiz\s*retake',
                    r'(?i)practice[\s-]*quiz',
                    r'(?i)sample[\s-]*quiz',
                    r'(?i)final'
                ]
            ),
            
            "Tests": CategoryPattern(
                prefixes=["test", "t", "midterm"],
                keywords=["test", "exam", "midterm"],
                assignment_types=["Test", "Exam"],
                compound_patterns=[
                    r'(?i)test\s*\d+',
                    r'(?i)^t\d+',
                    r'(?i)midterm\s*\d*',
                    r'(?i)exam\s*\d+'
                ],
                negative_patterns=[
                    r'(?i)final',
                    r'(?i)quiz',
                    r'(?i)practice',
                    r'(?i)sample'
                ],
                minimum_confidence=0.4
            ),
            
            "Participation": CategoryPattern(
                prefixes=["participation", "attend", "engage", "inclass", "in-class"],
                keywords=[
                    "participation",
                    "attendance",
                    "engagement",
                    "class participation",
                    "ed_participation",
                    "guest lecture",
                    "lecture",
                    "exercise",
                    "in-class",
                    "inclass"
                ],
                assignment_types=["Participation", "Attendance", "Exercise"],
                compound_patterns=[
                    r'(?i)class\s*participation',
                    r'(?i)lecture[_-]participation',
                    r'(?i)guest[_-]lecture',
                    r'(?i)in-?class[_-]exercise[_-]?\d*',
                    r'(?i)inclass[_-]exercise[_-]?\d*',
                    r'(?i)attendance\s*\d+'
                ]
            ),

            "Project": CategoryPattern(
                prefixes=["project", "p", "proj"],
                keywords=["project", "p", "proj"],
                assignment_types=["Project"],
                compound_patterns=[
                    r'(?i)project\s*\d+',
                    r'(?i)proj\s*\d+',
                    r'(?i)p\s*\d+',
                    r'(?i)^p\d+',
                    r'(?i)project[0-9]+',
                    r'(?i)^project\s+[0-9]+$'
                ],
                negative_patterns=[
                    r'(?i)lab',
                    r'(?i)quiz',
                    r'(?i)test',
                    r'(?i)final',
                    r'(?i)extra',
                    r'(?i)bonus'
                ]
            ),

            "Papers": CategoryPattern(
                prefixes=["paper", "p", "paper"],
                keywords=["paper", "p", "paper"],
                assignment_types=["Paper"],
                compound_patterns=[
                    r'(?i)paper\s*\d+',
                    r'(?i)p\s*\d+',
                    r'(?i)^p\d+',
                    r'(?i)paper[0-9]+',
                    r'(?i)^paper\s+[0-9]+$'
                ],
                negative_patterns=[
                    r'(?i)lab',
                    r'(?i)quiz',
                    r'(?i)test',
                    r'(?i)final',
                ]
            )
        }

        # Regular expressions for patterns
        self.number_pattern = re.compile(r'[0-9]+')
        self.separator_pattern = re.compile(r'[-_\s]+')
        self.date_pattern = re.compile(r'\b\d{1,2}/\d{1,2}\b')
        self.week_pattern = re.compile(r'(?i)week\s*\d+')
        
        # Context words dictionary
        self.context_words = {
            'group': 0.2,
            'team': 0.2,
            'individual': -0.1,
            'optional': -0.2,
            'practice': -0.3,
            'sample': -0.3
        }

    def should_skip_categorization(self, text: str, assignment_type: Optional[str] = None) -> tuple[bool, str]:
        """Check if an assignment should be left uncategorized"""
        normalized_text = self.normalize_text(text)
        
        # Patterns that should always be left uncategorized
        skip_patterns = [
            (r'(?i)extra\s*credit', "extra credit assignment"),
            (r'(?i)bonus', "bonus assignment"),
            (r'(?i)retake', "retake/makeup assignment"),
            (r'(?i)make[-\s]*up', "retake/makeup assignment"),
            (r'(?i)_ec(\s|$|_)', "extra credit assignment"),
            (r'(?i)[\s_-]bonus(\s|$)', "bonus assignment"),
            (r'(?i)[\s_-]extra(\s|$)', "extra credit assignment"),
            (r'(?i)_required$', "extra credit companion assignment"),
            (r'(?i)_make_?up(\s|$)', "makeup assignment"),
            (r'(?i)redo', "redo assignment"),
            (r'(?i)resubmission', "resubmitted assignment"),
            (r'(?i)_optional(\s|$)', "optional assignment"),
        ]
        
        for pattern, reason in skip_patterns:
            if re.search(pattern, normalized_text):
                return True, reason
                
        return False, ""

    def normalize_text(self, text: str) -> str:
        """Normalize text for pattern matching"""
        text = text.lower().strip()
        text = self.separator_pattern.sub(' ', text)
        return text

    def get_context_score(self, text: str) -> float:
        """Calculate context-based confidence adjustment"""
        normalized_text = self.normalize_text(text)
        score = 0.0
        
        # Check for context words
        for word, adjustment in self.context_words.items():
            if word in normalized_text:
                score += adjustment
        
        # Check for date/week patterns
        if self.date_pattern.search(text) or self.week_pattern.search(text):
            score += 0.1  # Slight boost for assignments with temporal information
            
        return score

    def check_compound_category(self, text: str, pattern: CategoryPattern) -> tuple[float, List[str]]:
        """Special handling for compound categories with separators"""
        if not pattern.is_compound_category or not pattern.compound_components:
            return 0.0, []
            
        normalized_text = self.normalize_text(text)
        parts = self.compound_separator_pattern.split(normalized_text)
        
        component_matches = sum(
            1 for component in pattern.compound_components 
            if any(component in part for part in parts)
        )
        
        if component_matches == 0:
            return 0.0, []
            
        confidence = (component_matches / len(pattern.compound_components)) * 0.8
        reasons = [f"compound_component_match:{component}" 
                  for component in pattern.compound_components 
                  if any(component in part for part in parts)]
                  
        return confidence, reasons

    def calculate_pattern_match_confidence(self, 
                                        text: str, 
                                        pattern: CategoryPattern, 
                                        assignment_type: Optional[str] = None) -> tuple[float, List[str]]:
        """Calculate confidence score and reasons for a pattern match"""
        normalized_text = self.normalize_text(text)
        confidence = 0.0
        reasons = []
        
        # If this is a compound category, start with the compound confidence
        if pattern.is_compound_category:
            compound_confidence, compound_reasons = self.check_compound_category(text, pattern)
            confidence = compound_confidence
            reasons.extend(compound_reasons)
            
            # If we have a strong compound match, boost confidence significantly
            if compound_confidence > 0.6:
                confidence += 0.2
        
        # Assignment type match (highest confidence)
        if assignment_type and assignment_type in pattern.assignment_types:
            confidence += 0.4
            reasons.append(f"assignment_type_match:{assignment_type}")
        
        # Compound pattern matches (very high confidence)
        if pattern.compound_patterns:
            for p in pattern.compound_patterns:
                if re.search(p, normalized_text):
                    old_confidence = confidence
                    confidence = max(confidence + 0.5, 0.8)
                    reasons.append(f"compound_pattern_match:{p}")
                    break
        
        # Prefix matches
        for prefix in pattern.prefixes:
            if any(word.startswith(prefix) for word in normalized_text.split()):
                confidence += 0.3
                reasons.append(f"prefix_match:{prefix}")
                break
        
        # Keyword matches
        keyword_matches = 0
        for keyword in pattern.keywords:
            if keyword in normalized_text:
                keyword_matches += 1
                reasons.append(f"keyword_match:{keyword}")
        confidence += min(keyword_matches * 0.2, 0.4)  # Cap keyword bonus
        
        # Negative pattern penalty
        if pattern.negative_patterns:
            for p in pattern.negative_patterns:
                if re.search(p, normalized_text):
                    old_confidence = confidence
                    confidence = max(0, confidence - 0.4)
                    reasons.append(f"negative_pattern_match:{p}")
        
        # Context adjustments
        context_score = self.get_context_score(text)
        confidence += context_score
        
        # Normalize final confidence
        confidence = max(0.0, min(1.0, confidence))
        
        # Check minimum confidence threshold
        if confidence < pattern.minimum_confidence:
            confidence = 0.0
            reasons = []
            
        return confidence, reasons

    def match_category(self, 
                      assignment_name: str, 
                      assignment_type: Optional[str] = None) -> CategoryMatch:
        """Match an assignment to a category with advanced confidence scoring"""
        # First check if we should skip categorization
        should_skip, skip_reason = self.should_skip_categorization(assignment_name, assignment_type)
        if should_skip:
            return CategoryMatch(
                category="Uncategorized",
                confidence=0.0,
                match_reasons=[f"skipped_categorization:{skip_reason}"]
            )
            
        # Also skip if this appears to be a duplicate or variant
        words = self.normalize_text(assignment_name).split()
        if any(word in ['regrade', 'revised', 'update', 'correction'] for word in words):
            return CategoryMatch(
                category="Uncategorized",
                confidence=0.0,
                match_reasons=["skipped_categorization:assignment_variant"]
            )
        
        best_match = CategoryMatch(
            category="Uncategorized",
            confidence=0.0,
            match_reasons=[]
        )
        
        # Filter available categories
        patterns_to_check = {}
        for category, pattern in self.category_patterns.items():
            if (self.available_categories is None or 
                category.lower() in self.available_categories):
                patterns_to_check[category] = pattern
        
        # Calculate confidence for each category
        for category, pattern in patterns_to_check.items():
            confidence, reasons = self.calculate_pattern_match_confidence(
                assignment_name, 
                pattern, 
                assignment_type
            )
            
            # Update best match if confidence is higher
            if confidence > best_match.confidence:
                best_match = CategoryMatch(
                    category=category,
                    confidence=confidence,
                    match_reasons=reasons
                )
        
        return best_match