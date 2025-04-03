from openai import OpenAI
from fastapi import HTTPException
from dotenv import load_dotenv
from typing import List, Optional, Dict, Tuple
import os
import asyncio
import re
from datetime import datetime, timedelta

load_dotenv()

class OpenAICategorizer:
    def __init__(self, api_key: Optional[str] = None):
        api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("Warning: No OpenAI API key found. Will use rule-based categorization only.")
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key)
        
        self.last_call_time = datetime.now()
        self.call_count = 0
        self.rate_limit = 20  # calls per minute
        self.batch_size = 10  # process assignments in batches
        self.retry_delay = 5  # seconds to wait between retries
        self.max_retries = 3  # maximum number of retry attempts

    def sanitize_input(self, text: Optional[str]) -> str:
        """
        Sanitize input to prevent prompt injection attacks.
        """
        if text is None:
            return "Not specified"
            
        # Convert to string if not already
        text = str(text)
            
        # Remove control characters and zero-width characters
        sanitized = re.sub(r'[\x00-\x1F\x7F\u200B-\u200F\u2060-\u2064\uFEFF]', '', text)
        
        # Remove common markdown and code formatting
        sanitized = re.sub(r'```[\s\S]*?```', '[code block removed]', sanitized)
        sanitized = re.sub(r'`[^`]*`', '[inline code removed]', sanitized)
        sanitized = re.sub(r'\#{1,6}\s', '', sanitized)  # Markdown headers
        
        # Remove HTML tags that might be interpreted
        sanitized = re.sub(r'<[^>]*>', '[html removed]', sanitized)
        
        # Remove prompt injection keywords and suspicious patterns
        injection_patterns = [
            # Basic instruction override attempts
            r'ignore previous instructions',
            r'ignore all instructions',
            r'forget your instructions',
            r'new instructions',
            r'disregard',
            r'please ignore',
            
            # Role-based attacks
            r'system prompt',
            r'user prompt',
            r'assistant prompt',
            r'\[system\]',
            r'\[user\]',
            r'\[assistant\]',
            r'<system>',
            r'<user>',
            r'<assistant>',
            r'role: system',
            r'role: user',
            r'role: assistant',
            r'as a(n)? (language|AI|LLM|GPT)',
            r'you are not assistant',
            r'you are not an AI',
            
            # Markdown and formatting
            r'---+',  # Markdown separators
            r'\*\*\*+',
            r'___+',
            
            # Context jailbreaks
            r'DAN',
            r'Do Anything Now',
            r'delimiters',
            r'context window',
            r'token limit',
            r'continue (the|this) (text|story|conversation)',
            r'pretend to be',
            r'let\'s play a game',
            r'assume you are',
            r'simulate',
            r'act as if',
            r'continue from',
            r'ignore safety',
            r'bypass (filter|restriction)',
            
            # Tokenization manipulation
            r'base64',
            r'base 64',
            r'unicode',
            r'token[ize|ization]',
            r'utf-?8',
            r'ascii',
            r'hex',
            r'encoding',
            r'special characters',
            
            # API manipulation
            r'temperature',
            r'max_tokens',
            r'top_p',
            r'frequency_penalty',
            r'presence_penalty',
            r'stop sequence',
            r'openai',
            r'api key',
            r'model',
            
            # Unicode homoglyphs and obfuscation
            r'ѕyѕtem',
            r'ѕystem',
            r'аssistant',
            r'usеr',
            
            # Multi-lingual attempts
            r'système',
            r'système',
            r'instruktionen ignorieren',
            r'ignorar instrucciones',
            
            # Escape sequence awareness
            r'backslash n',
            r'\\n',
            r'carriage return',
            r'newline',
            
            # Specific model references
            r'gpt',
            r'llama',
            r'claude',
            r'bard',
            r'gemini'
        ]
        
        for pattern in injection_patterns:
            sanitized = re.sub(pattern, '[filtered]', sanitized, flags=re.IGNORECASE)
        
        # Filter out repetitive characters that might be used for manipulation
        sanitized = re.sub(r'(.)\1{10,}', r'\1\1\1', sanitized)
        
        # Handle homoglyphs and similar Unicode tricks
        # Map visually similar characters to their ASCII equivalents
        homoglyph_map = {
            'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 
            'ѕ': 's', 'і': 'i', 'ј': 'j', 'ӏ': 'l', 'ԁ': 'd',
            'ɑ': 'a', 'ɡ': 'g', 'ι': 'i', 'ϲ': 'c', 'ｅ': 'e'
        }
        for char, replacement in homoglyph_map.items():
            sanitized = sanitized.replace(char, replacement)
        
        # Limit length to prevent excessive inputs
        if len(sanitized) > 200:
            sanitized = sanitized[:197] + '...'
            
        # Final cleanup pass - remove any suspicious character sequences
        sanitized = re.sub(r'[^\w\s.,;:!?()[\]{}\/\'"@#$%^&*+=\-]', ' ', sanitized)
        
        # Normalize whitespace
        sanitized = re.sub(r'\s+', ' ', sanitized).strip()
        
        return sanitized

    def is_safe_category(self, category: str, available_categories: List[str]) -> bool:
        """
        Validate that a category is legitimate and safe to use.
        """
        # Case-insensitive check for exact match
        for valid_category in available_categories:
            if category.lower() == valid_category.lower():
                return True
                
        # Check similarity for possible typo/variant
        for valid_category in available_categories:
            # Simple similarity check - 80% character overlap
            if len(set(category.lower()) & set(valid_category.lower())) / len(set(valid_category.lower())) > 0.8:
                return True
                
        return False

    async def wait_for_rate_limit(self):
        """Implement rate limiting"""
        if not self.client:
            return
            
        now = datetime.now()
        elapsed = (now - self.last_call_time).total_seconds()
        
        if elapsed < 60 and self.call_count >= self.rate_limit:
            wait_time = 60 - elapsed
            await asyncio.sleep(wait_time)
            self.call_count = 0
            self.last_call_time = datetime.now()
        elif elapsed >= 60:
            self.call_count = 0
            self.last_call_time = now

    async def suggest_categories_batch(self, 
                                    assignments: List[Tuple[str, Optional[str]]], 
                                    available_categories: List[str],
                                    retry_count: int = 0) -> List[Tuple[str, float, List[str]]]:
        """Process multiple assignments in a single API call with retry logic"""
        if not self.client or not assignments:
            return [(None, 0.0, []) for _ in assignments]

        await self.wait_for_rate_limit()
        
        # Input validation
        if not available_categories or not all(isinstance(c, str) for c in available_categories):
            print("Invalid categories provided")
            return [(None, 0.0, []) for _ in assignments]
            
        # Double check assignments format
        valid_assignments = []
        for assignment in assignments:
            if not isinstance(assignment, tuple) or len(assignment) != 2:
                continue
            name, type_ = assignment
            if not isinstance(name, (str, type(None))):
                continue
            valid_assignments.append(assignment)
            
        if not valid_assignments:
            return [(None, 0.0, []) for _ in assignments]
        
        # Sanitize inputs
        sanitized_assignments = []
        for name, type_ in valid_assignments:
            sanitized_name = self.sanitize_input(name)
            sanitized_type = self.sanitize_input(type_)
            sanitized_assignments.append((sanitized_name, sanitized_type))
        
        # Sanitize categories
        sanitized_categories = [self.sanitize_input(category) for category in available_categories]
        
        # Create a safe system message
        system_message = "You are a helpful teaching assistant that categorizes academic assignments. Only respond with the exact format specified."
        
        prompt = """Given these assignments:

"""
        for i, (name, type_) in enumerate(sanitized_assignments, 1):
            prompt += f"{i}. Name: {name}\n   Type: {type_}\n\n"
        
        prompt += f"""Available categories: {', '.join(sanitized_categories)}

For each assignment above, categorize it into one of the available categories.
Respond with one categorization per assignment, with a blank line between each.
Do not include numbering or separator lines.

Use this exact format:

Category: [category name]
Confidence: [number 0-1]
Reasons: [brief comma-separated list]

Example format:
Category: Quizzes
Confidence: 0.95
Reasons: quiz in name, numbered assessment

Remember:
- Only use categories from the provided list
- One categorization per assignment
- Include all three lines (Category, Confidence, Reasons)
- Leave a blank line between assignments"""

        try:
            self.call_count += 1
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,
                max_tokens=500
            )
            
            # Parse the response
            response_text = response.choices[0].message.content
            # Split on '---' or double newlines, and filter out empty sections
            sections = [s.strip() for s in response_text.replace('---', '\n\n').split('\n\n') if s.strip()]
            results = []
            
            for section in sections:
                if not section.strip() or section.strip() == '---':
                    continue
                try:
                    # Split into lines and ignore numbering
                    lines = [line.strip() for line in section.split('\n') if line.strip()]
                    
                    if not any('Category:' in line for line in lines):
                        continue  # Skip sections without category information
                        
                    # Find the lines that contain our data using more robust parsing
                    category_line = next((line for line in lines if 'Category:' in line), None)
                    confidence_line = next((line for line in lines if 'Confidence:' in line), None)
                    reasons_line = next((line for line in lines if 'Reasons:' in line), None)
                    
                    # Skip if any required field is missing
                    if not category_line or not confidence_line or not reasons_line:
                        print(f"Missing required fields in response section")
                        results.append((None, 0.0, []))
                        continue
                    
                    # Extract the values
                    category = category_line.split('Category:')[1].strip()
                    
                    # Try to convert confidence to float, with fallback
                    try:
                        confidence = float(confidence_line.split('Confidence:')[1].strip())
                        # Clamp confidence to valid range
                        confidence = max(0.0, min(1.0, confidence))
                    except (ValueError, IndexError):
                        confidence = 0.0
                        
                    reasons = [r.strip() for r in reasons_line.split('Reasons:')[1].strip().split(',')]
                    
                    # Additional sanitization of outputs
                    category = self.sanitize_input(category)
                    reasons = [self.sanitize_input(r) for r in reasons]
                    
                    # Validate the category is in available categories
                    if self.is_safe_category(category, sanitized_categories):
                        results.append((category, confidence, reasons))
                    else:
                        print(f"Invalid category received from OpenAI: {category}")
                        results.append((None, 0.0, []))
                except (StopIteration, ValueError, IndexError) as e:
                    print(f"Error parsing OpenAI response section '{section}': {str(e)}")
                    results.append((None, 0.0, []))
            
            # Pad results if necessary
            while len(results) < len(valid_assignments):
                results.append((None, 0.0, []))
                
            # Pad more if original assignments had invalid items
            while len(results) < len(assignments):
                results.append((None, 0.0, []))
                
            return results
            
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            
            # If quota error and haven't exceeded max retries, wait and try again
            if "insufficient_quota" in str(e) and retry_count < self.max_retries:
                print(f"Quota error, retrying in {self.retry_delay} seconds...")
                await asyncio.sleep(self.retry_delay * (retry_count + 1))
                return await self.suggest_categories_batch(
                    assignments, 
                    available_categories,
                    retry_count + 1
                )
                
            return [(None, 0.0, []) for _ in assignments]

    @staticmethod
    def should_use_openai(rule_based_confidence: float) -> bool:
        """Determine if OpenAI should be used based on rule-based confidence."""
        return rule_based_confidence < 0.5  # Only use OpenAI for truly ambiguous cases