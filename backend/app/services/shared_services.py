"""
Shared service instances to be used across the application.
This module prevents circular imports while allowing for shared caching.
"""

from .openai_integration import OpenAICategorizer

# Shared OpenAI categorizer with memoization
openai_categorizer = OpenAICategorizer() 