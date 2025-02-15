from typing import List

from helpers.claim import analyze_claim
from util.llm import call_groq
from util.prompts import EXTRACT_CLAIMS_PROMPT


def extract_claims(author: str, content: str) -> List[str]:
    prompt = f"""Author: {author}\nContent: {content}"""

    messages = [
        {
            "role": "system",
            "content": EXTRACT_CLAIMS_PROMPT
        },
        {
            "role": "user",
            "content": prompt,
        },
    ]

    completion = call_groq(messages)["content"]

    claims = [v.strip() for v in completion.split("\n")]

    return claims


def evaluate_claims_in_post(author: str, content: str):
    claims = extract_claims(author, content)

    evaluations = []

    for claim in claims:
        sources, explanation, is_misleading = analyze_claim(content, claim)
        evaluations.append({
            "claim": claim,
            "sources": sources,
            "explanation": explanation,
            "is_misleading": is_misleading
        })

    return evaluations
