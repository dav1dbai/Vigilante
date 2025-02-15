import base64
from typing import List

from util.supabase import supabase_client
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

    print(claims)

    for claim in claims:
        sources, explanation, is_misleading = analyze_claim(content, claim)
        evaluations.append({
            "claim": claim,
            "sources": sources,
            "explanation": explanation,
            "is_misleading": is_misleading
        })

    return evaluations


def analyze_post(tweet_id, tweet_author, tweet_text, base64_image, save_to_supabase=True):
    # check if already analyzed tweet
    response = supabase_client.table("tweets").select("id").eq(
        "original_tweet_id", tweet_id).execute()
    if response.data:
        analysis_response = supabase_client.table("analyses").select(
            "is_misleading").eq("tweet_id", tweet_id).limit(1).single().execute()

        final_decision = analysis_response.data['is_misleading'] == "misleading"

        claims_response = supabase_client.table("claims").select(
            "claim,sources,explanation,is_misleading").eq("tweet_id", tweet_id).execute()

        claim_results = claims_response.data
    else:
        if base64_image:
            try:
                image_data = base64.b64decode(base64_image)
                with open("image.png", "wb") as f:
                    f.write(image_data)
            except Exception as e:
                return {
                    "error": "Failed to decode and save the base64 image.",
                    "details": str(e)
                }

        # TODO: handle image
        claim_results = evaluate_claims_in_post(
            author=tweet_author, content=tweet_text)

        final_decision = all(c["is_misleading"] for c in claim_results)

        # save the tweet analysis to Supabase
        if save_to_supabase:
            try:
                supabase_client.table("tweets").insert({
                    "original_tweet_id": tweet_id,
                    "author": tweet_author,
                    "text": tweet_text
                }).execute()

                for claim in claim_results:
                    supabase_client.table("claims").insert({
                        "original_tweet_id": tweet_id,
                        "claim": claim["claim"],
                        "sources": claim["sources"],
                        "explanation": claim["explanation"],
                        "is_misleading": "misleading" if claim["is_misleading"] else "accurate"
                    }).execute()

                supabase_client.table("analyses").insert({
                    "original_tweet_id": tweet_id,
                    "is_misleading": "misleading" if final_decision else "accurate"
                }).execute()

            except Exception as e:
                return {
                    "error": "Failed to save analysis to the database.",
                    "details": str(e)
                }

    return {
        "tweet_id": tweet_id,
        "claims": claim_results,
        "final_decision": final_decision
    }
