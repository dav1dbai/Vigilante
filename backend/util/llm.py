import json
import os
import time  # used for sleeping between retries
from dotenv import load_dotenv
from datetime import datetime, timedelta

import requests
import groq
from groq import Groq

load_dotenv()

# Instead of a single key, maintain a list of keys.
GROQ_API_KEYS = [
    os.environ["GROQ_API_KEY_1"],
    os.environ["GROQ_API_KEY_2"],
    os.environ["GROQ_API_KEY_3"],
    os.environ["GROQ_API_KEY_4"],
]
# Global index to track the current API key being used.
CURRENT_GROQ_API_KEY_INDEX = 0

# Track last use time for each API key
GROQ_KEY_LAST_USED = {i: datetime.min for i in range(len(GROQ_API_KEYS))}
MIN_DELAY_PER_KEY = 0.5  # seconds between uses of the same key

PPLX_API_KEY = os.environ["PPLX_API_KEY"]

# Initialize the groq client with the first API key.
groq_client = Groq(api_key=GROQ_API_KEYS[CURRENT_GROQ_API_KEY_INDEX])

class AllAPIKeysExhaustedError(Exception):
    pass

def call_groq(messages, model="llama-3.2-11b-vision-preview", temperature=0):
    """
    Calls the GROQ API to generate a completion.
    
    Maintains a minimum delay between uses of the same API key while allowing immediate
    switching to other available keys. If all keys are rate-limited or too recently used,
    raises AllAPIKeysExhaustedError.
    """
    global CURRENT_GROQ_API_KEY_INDEX
    global groq_client
    global GROQ_KEY_LAST_USED

    max_attempts = len(GROQ_API_KEYS)
    attempts = 0
    
    while attempts < max_attempts:
        # Try each key in sequence
        CURRENT_GROQ_API_KEY_INDEX = (CURRENT_GROQ_API_KEY_INDEX + 1) % len(GROQ_API_KEYS)
        
        # Check if enough time has passed since this key's last use
        time_since_last_use = datetime.now() - GROQ_KEY_LAST_USED[CURRENT_GROQ_API_KEY_INDEX]
        if time_since_last_use.total_seconds() < MIN_DELAY_PER_KEY:
            attempts += 1
            continue
            
        groq_client = Groq(api_key=GROQ_API_KEYS[CURRENT_GROQ_API_KEY_INDEX])
        
        try:
            completion = groq_client.chat.completions.create(
                messages=messages,
                model=model,
                stop=None,
                temperature=temperature,
            )
            # Update last used time on successful completion
            GROQ_KEY_LAST_USED[CURRENT_GROQ_API_KEY_INDEX] = datetime.now()
            return {
                "content": completion.choices[0].message.content
            }
        except groq.RateLimitError:
            attempts += 1
            print(
                f"Rate limit reached using API key index {CURRENT_GROQ_API_KEY_INDEX}. Trying next key..."
            )
        except Exception as exc:
            # Propagate any exception other than rate limit error
            raise exc

    raise AllAPIKeysExhaustedError("All GROQ API keys exhausted due to rate limits or minimum delay requirements.")


def call_perplexity(messages, temperature=0):
    url = "https://api.perplexity.ai/chat/completions"

    payload = {
        "model": "sonar",
        "messages": messages,
        "temperature": temperature,
        "return_images": False,
        "return_related_questions": False,
        "search_recency_filter": "month",
    }
    headers = {
        "Authorization": f"Bearer {PPLX_API_KEY}",
        "Content-Type": "application/json"
    }

    res = requests.request("POST", url, json=payload, headers=headers)
    completion = json.loads(res.text)

    return {
        "content": completion["choices"][0]["message"]["content"],
        "citations": completion["citations"]
    }
