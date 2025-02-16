import base64
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Optional

from util.supabase import supabase_client
from helpers.claim import analyze_claim
from util.llm import call_groq
from util.prompts import EXTRACT_CLAIMS_PROMPT, IS_VERIFIABLE_PROMPT, SEMANTIC_RELEVANCE_PROMPT, UNIFIED_ANALYSIS_PROMPT


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

    def process_claim(claim):
        result = analyze_claim(content, claim)

        if result is None:
            return None

        sources, explanation, is_misleading = result

        return {
            "claim": claim,
            "sources": sources,
            "explanation": explanation,
            "is_misleading": is_misleading
        }

    with ThreadPoolExecutor() as executor:
        futures = {executor.submit(process_claim, claim): claim for claim in claims}

        for future in as_completed(futures):
            try:
                result = future.result()
                if result is not None:
                    evaluations.append(result)
            except Exception as e:
                print(f"Error processing claim {futures[future]}: {e}")
    # print("evaluations", evaluations)
    return evaluations


def is_verifiable(tweet_text):
    completion = call_groq([
        {
            "role": "system",
            "content": IS_VERIFIABLE_PROMPT
        },
        {
            "role": "user",
            "content": tweet_text
        }
    ], model="gemma2-9b-it")

    # print(completion["content"])

    return completion["content"].strip() == "YES"


async def analyze_post(tweet_id, tweet_author, tweet_text, base64_image, timestamp, save_to_supabase=True):
    # Check if tweet was already analyzed
    response = supabase_client.table("tweets").select("id").eq(
        "original_tweet_id", tweet_id).execute()

    if response.data:
        print("tweet already analyzed in supabase")
        # Existing analysis retrieval code remains the same:
        analysis_response = supabase_client.table("analyses").select(
            "is_misleading").eq("original_tweet_id", tweet_id).limit(1).single().execute()

        is_misleading =  (analysis_response.data['is_misleading'] == "misleading")

        claims_response = supabase_client.table("claims").select(
            "claim,sources,explanation,is_misleading").eq("original_tweet_id", tweet_id).execute()

        claim_results = claims_response.data
    else:
        # New unified analysis:
        verifiable = is_verifiable(tweet_text)
        if verifiable:
            print("verifiable")
            content = tweet_text  # Initialize content with tweet_text
            if base64_image:
                try:
                    image_message = [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Describe the main content of this image, focusing especially on extracting any text."},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"{base64_image}"
                                    }
                                }
                            ]
                        }
                    ]
                    image_caption = call_groq(image_message, model="llama-3.2-11b-vision-preview")["content"]
                    content = f"{tweet_text}\n[Image content: {image_caption}]"
                except Exception as e:
                    print(f"Error processing image for tweet {tweet_id}: {str(e)}")
                    # content already set to tweet_text, no need to set again

            claim_results = evaluate_claims_in_post(author=tweet_author, content=content)
            # print("claim_results", claim_results)
            is_misleading = any(c["is_misleading"] for c in claim_results)
        else:
            claim_results = []
            is_misleading = None

        # Save to Supabase if enabled using asynchronous (batch) submits
        if save_to_supabase:
            try:
                # Insert tweet record first because it may be needed as a foreign key.
                await asyncio.to_thread(
                    lambda: supabase_client.table("tweets").insert({
                        "original_tweet_id": tweet_id,
                        "author": tweet_author,
                        "text": tweet_text,
                        "timestamp": timestamp
                    }).execute()
                )

                # Create asynchronous tasks for each claim insert.
                claim_tasks = []
                for claim in claim_results:
                    if claim['claim'] is None or not claim['sources']:
                        print("Skipping claim because it's empty")
                        continue
                    task = asyncio.to_thread(
                        lambda c=claim: supabase_client.table("claims").insert({
                            "original_tweet_id": tweet_id,
                            "claim": c["claim"],
                            "sources": c["sources"],
                            "explanation": c["explanation"],
                            "is_misleading": "misleading" if c["is_misleading"] else "accurate"
                        }).execute()
                    )
                    claim_tasks.append(task)

                # Also create a task for the analysis insert.
                analysis_task = asyncio.to_thread(
                    lambda: supabase_client.table("analyses").insert({
                        "original_tweet_id": tweet_id,
                        "is_misleading": "misleading" if is_misleading is True else ("accurate" if is_misleading is False else None)
                    }).execute()
                )

                # Run claim inserts and the analysis insert concurrently.
                await asyncio.gather(*claim_tasks, analysis_task)
            except Exception as e:
                return {
                    "error": "Failed to save analysis to the database.",
                    "details": str(e)
                }

    return {
        "tweet_id": tweet_id,
        "claims": claim_results,
        "final_decision": is_misleading
    }


def check_semantic_relevance(description, tweet_text):
    completion = call_groq([
        {
            "role": "system",
            "content": SEMANTIC_RELEVANCE_PROMPT.format(description=description)
        },
        {
            "role": "user",
            "content": tweet_text
        }
    ], model="gemma2-9b-it")

    return completion["content"].strip() == "YES"