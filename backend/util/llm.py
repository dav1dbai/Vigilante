import json
import os
from dotenv import load_dotenv

import requests
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
PPLX_API_KEY = os.environ["PPLX_API_KEY"]

groq_client = Groq(api_key=GROQ_API_KEY)


def call_groq(messages, model="llama-3.2-11b-vision-preview", temperature=0):
    completion = groq_client.chat.completions.create(
        messages=messages,
        model=model,
        stop=None,
        temperature=temperature,
    )

    return {
        "content": completion.choices[0].message.content
    }


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
