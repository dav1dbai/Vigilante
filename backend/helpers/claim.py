from util.llm import call_groq, call_perplexity
from util.prompts import DETERMINE_IS_MISLEADING_PROMPT, IS_CONTROVERSIAL_PROMPT, SOURCES_INPUT_PROMPT, SOURCES_SYSTEM_PROMPT


def check_valid_claim(claim: str):
    completion = call_groq([
        {
            "role": "system",
            "content": IS_CONTROVERSIAL_PROMPT
        },
        {
            "role": "user",
            "content": claim
        }
    ], model="gemma2-9b-it")

    return completion["content"].strip() == "YES"


def fact_check_claim(post_content: str, claim: str):
    input_prompt = SOURCES_INPUT_PROMPT.format(
        post_content=post_content, claim=claim)

    completion = call_perplexity([
        {
            "role": "system",
            "content": SOURCES_SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": input_prompt
        }
    ])

    sources = completion["citations"]
    explanation = completion["content"]

    return (sources, explanation)


def determine_is_misleading(post_content: str, claim: str, evidence: str):
    input_prompt = SOURCES_INPUT_PROMPT.format(
        post_content=post_content, claim=claim)

    completion = call_groq([
        {
            "role": "user",
            "content": input_prompt
        },
        {
            "role": "assistant",
            "content": evidence,
        },
        {
            "role": "user",
            "content": DETERMINE_IS_MISLEADING_PROMPT,
        },
    ], model="llama-3.1-8b-instant")

    return completion["content"].strip() == "MISLEADING"


def analyze_claim(post_content: str, claim: str):
    is_valid = check_valid_claim(claim)
    if not is_valid:
        return None

    sources, explanation = fact_check_claim(post_content, claim)
    is_misleading = determine_is_misleading(post_content, claim, explanation)

    return (sources, explanation, is_misleading)
