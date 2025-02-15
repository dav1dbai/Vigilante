from util.llm import call_groq, call_perplexity
from util.prompts import DETERMINE_IS_MISLEADING_PROMPT, SOURCES_INPUT_PROMPT, SOURCES_SYSTEM_PROMPT


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

    return completion["content"] == "MISLEADING"


def analyze_claim(post_content: str, claim: str):
    sources, explanation = fact_check_claim(post_content, claim)
    is_misleading = determine_is_misleading(post_content, claim, explanation)

    return (sources, explanation, is_misleading)
