from openai import OpenAI
from fastapi import HTTPException
from dotenv import load_dotenv
from typing import List, Optional, Dict, Tuple, Any
import os
import asyncio
import re
import time
import json
import pickle
from pathlib import Path
from datetime import datetime, timedelta

load_dotenv()

class OpenAICategorizer:
    def __init__(self, api_key: Optional[str] = None, cache_dir: Optional[str] = None):
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
        
        # Add memoization cache
        self._cache = {}
        self._cache_ttl = timedelta(hours=24)  # Cache valid for 24 hours
        self._cache_hits = 0
        self._cache_misses = 0
        
        # Setup persistent cache
        self.cache_dir = cache_dir or os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'cache')
        self.cache_file = os.path.join(self.cache_dir, 'openai_cache.pkl')
        
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Load cache from disk if it exists
        self._load_cache_from_disk()
        
        # Schedule periodic cache saving
        self._last_save_time = datetime.now()
        self._save_interval = timedelta(minutes=5)  # Save every 5 minutes

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
            r'\bDAN\b',
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

        start_time = time.time()
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
        
        # Check cache before making API call
        # Create a cache key based on assignments and categories
        cache_key = self._create_cache_key(valid_assignments, available_categories)
        cached_result = self._get_from_cache(cache_key)
        if cached_result is not None:
            self._cache_hits += 1
            elapsed = time.time() - start_time
            print(f"Cache hit! Using cached categorization for {len(valid_assignments)} assignments (took {elapsed:.3f}s)")
            return cached_result
        
        self._cache_misses += 1
        print(f"Cache miss. Processing {len(valid_assignments)} assignments with OpenAI API")
        
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
            prompt += f"{i}. Name: {name}\n   Type: {type_ or 'Not specified'}\n\n"
        
        # Present categories as a numbered list
        prompt += "Available categories (REFERENCE BY NUMBER ONLY):\n"
        for i, category in enumerate(sanitized_categories, 1):
            prompt += f"{i}. {category}\n"
        
        prompt += f"""
==============================================================
⚠️ CRITICAL INSTRUCTION - READ CAREFULLY ⚠️
==============================================================
YOU MUST RESPOND WITH THE CATEGORY NUMBER, NOT THE NAME.

For each assignment above, categorize it into one of the available categories.
Respond with one categorization per assignment, with a blank line between each.
Number each categorization with the assignment number.

Use this EXACT format for each assignment:

Assignment Number: [number]
Category Number: [category number from the list above]
Confidence: [number 0-1]
Reasons: [brief comma-separated list]

Example:
Assignment Number: a
Category Number: 2
Confidence: 0.95
Reasons: quiz in name, numbered assessment

Remember:
- ALWAYS use the CATEGORY NUMBER from the numbered list above
- DO NOT write out the category names in your response
- Include all four lines per assignment
- Confidence should be a decimal between 0 and 1
- Leave a blank line between assignments
"""

        try:
            api_call_start = time.time()
            self.call_count += 1
            completion = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="gpt-4o-mini",
                temperature=0.1,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ]
            )
            api_call_time = time.time() - api_call_start
            
            response = completion.choices[0].message.content
            print(f"OpenAI response: {response}")  # Debug logging
            
            # Parse response
            results = []
            # Split the response by blank lines to get individual assignment categorizations
            categorizations = re.split(r'\n\s*\n', response.strip())
            
            for i, (name, _) in enumerate(sanitized_assignments):
                try:
                    # Find the matching categorization for this assignment
                    assignment_index = i + 1
                    matching_categorization = None
                    
                    for cat in categorizations:
                        # Look for the assignment number
                        assignment_match = re.search(r'Assignment\s*(?:Number)?:\s*(\d+)', cat, re.IGNORECASE)
                        if assignment_match and int(assignment_match.group(1)) == assignment_index:
                            matching_categorization = cat
                            break
                    
                    if matching_categorization:
                        # Extract category number, confidence, and reasons
                        category_match = re.search(r'Category\s*(?:Number)?:\s*(\d+)', matching_categorization)
                        confidence_match = re.search(r'Confidence:\s*([0-9.]+)', matching_categorization)
                        reasons_match = re.search(r'Reasons:\s*(.+?)$', matching_categorization, re.MULTILINE | re.DOTALL)
                        
                        if category_match and confidence_match and reasons_match:
                            category_num = int(category_match.group(1))
                            confidence = float(confidence_match.group(1))
                            reasons = [r.strip() for r in reasons_match.group(1).split(',')]
                            
                            # Convert category number to actual category name
                            if 1 <= category_num <= len(sanitized_categories):
                                category = sanitized_categories[category_num - 1]
                                results.append((category, confidence, reasons))
                            else:
                                print(f"Invalid category number received from OpenAI: {category_num}")
                                results.append((None, 0.0, ["invalid_category_number"]))
                        else:
                            print(f"Couldn't extract info for assignment {assignment_index}: {name}")
                            results.append((None, 0.0, ["parsing_error"]))
                    else:
                        print(f"No categorization found for assignment {assignment_index}: {name}")
                        results.append((None, 0.0, ["missing_categorization"]))
                except Exception as e:
                    print(f"Error parsing OpenAI response for assignment {i+1} ({name}): {str(e)}")
                    results.append((None, 0.0, [f"parsing_error: {str(e)}"]))
            
            # Cache the results before returning
            self._add_to_cache(cache_key, results)
            
            # Check if we need to save the cache to disk
            if datetime.now() - self._last_save_time > self._save_interval:
                self._save_cache_to_disk()
                self._last_save_time = datetime.now()
            
            total_elapsed = time.time() - start_time
            print(f"OpenAI API call took {api_call_time:.3f}s, total processing time: {total_elapsed:.3f}s")
            
            return results
            
        except Exception as e:
            elapsed = time.time() - start_time
            print(f"OpenAI API error after {elapsed:.3f}s: {str(e)}")
            # Retry logic if network/API error
            if retry_count < self.max_retries:
                await asyncio.sleep(self.retry_delay * (retry_count + 1))  # Exponential backoff
                return await self.suggest_categories_batch(assignments, available_categories, retry_count+1)
            return [(None, 0.0, [f"api_error: {str(e)}"]) for _ in valid_assignments]

    def _create_cache_key(self, assignments: List[Tuple[str, Optional[str]]], categories: List[str]) -> str:
        """Create a deterministic cache key from assignments and categories"""
        # Sort assignments and categories to ensure consistent keys regardless of order
        sorted_assignments = sorted([(name or "", type_ or "") for name, type_ in assignments])
        sorted_categories = sorted(categories)
        
        # Create a string representation
        assignments_str = ";".join([f"{name}|{type_}" for name, type_ in sorted_assignments])
        categories_str = ",".join(sorted_categories)
        
        # Use a hash for shorter keys
        return f"{hash(assignments_str)}:{hash(categories_str)}"
    
    def _get_from_cache(self, key: str) -> Optional[List[Tuple[str, float, List[str]]]]:
        """Retrieve result from cache if it exists and is not expired"""
        if key not in self._cache:
            return None
            
        timestamp, result = self._cache[key]
        if datetime.now() - timestamp > self._cache_ttl:
            # Cache expired
            del self._cache[key]
            return None
            
        return result
    
    def _add_to_cache(self, key: str, result: List[Tuple[str, float, List[str]]]) -> None:
        """Add result to cache with current timestamp"""
        self._cache[key] = (datetime.now(), result)
        
        # Implement basic cache eviction if it gets too large
        if len(self._cache) > 1000:  # Arbitrary limit
            # Remove oldest entries
            oldest_keys = sorted(self._cache.keys(), key=lambda k: self._cache[k][0])[:200]
            for old_key in oldest_keys:
                del self._cache[old_key]
    
    def get_cache_stats(self) -> dict:
        """Return cache statistics"""
        return {
            "cache_size": len(self._cache),
            "cache_hits": self._cache_hits,
            "cache_misses": self._cache_misses,
            "hit_ratio": self._cache_hits / (self._cache_hits + self._cache_misses) if (self._cache_hits + self._cache_misses) > 0 else 0,
            "last_save_time": self._last_save_time.isoformat() if hasattr(self, '_last_save_time') else None,
            "cache_file": self.cache_file
        }
        
    def clear_cache(self) -> None:
        """Clear the cache"""
        self._cache = {}
        # Also clear the disk cache
        if os.path.exists(self.cache_file):
            os.remove(self.cache_file)
        print(f"Cache cleared (in-memory and disk file: {self.cache_file})")
        
    def _load_cache_from_disk(self) -> None:
        """Load the cache from disk if it exists"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'rb') as f:
                    disk_cache = pickle.load(f)
                    
                # Check for expired entries
                now = datetime.now()
                valid_entries = {
                    k: v for k, v in disk_cache.items() 
                    if now - v[0] <= self._cache_ttl
                }
                
                self._cache = valid_entries
                print(f"Loaded {len(valid_entries)} valid entries from disk cache")
                
                # If entries were removed due to expiration, save the cleaned cache
                if len(valid_entries) < len(disk_cache):
                    print(f"Removed {len(disk_cache) - len(valid_entries)} expired entries from cache")
                    self._save_cache_to_disk()
                    
            except (pickle.PickleError, EOFError, FileNotFoundError) as e:
                print(f"Error loading cache from disk: {str(e)}")
                # Start with a fresh cache if there's an error
                self._cache = {}
        else:
            print(f"No disk cache found at {self.cache_file}")
            
    def _save_cache_to_disk(self) -> None:
        """Save the cache to disk"""
        try:
            with open(self.cache_file, 'wb') as f:
                pickle.dump(self._cache, f)
            print(f"Saved {len(self._cache)} entries to disk cache")
        except (pickle.PickleError, IOError) as e:
            print(f"Error saving cache to disk: {str(e)}")

    @staticmethod
    def should_use_openai(rule_based_confidence: float) -> bool:
        """Determine if OpenAI should be used based on rule-based confidence."""
        return rule_based_confidence < 0.5  # Only use OpenAI for truly ambiguous cases