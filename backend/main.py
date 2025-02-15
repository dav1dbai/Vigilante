from typing import Optional
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import base64

from helpers.post import evaluate_claims_in_post
from util import supabase

app = FastAPI()

# Configure CORS for localhost:3000
origins = [
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze_tweet")
def analyze_tweet(
    tweet_id: str = Body(..., embed=True),
    tweet_author: str = Body(..., embed=True),
    tweet_text: str = Body(..., embed=True),
    base64_image: Optional[str] = Body(..., embed=True)
):
    """
    Accepts:
      1) tweet_id (str)
      2) tweet_text (str)
      3) base64_image (str - PNG image in base64)

    Steps:
      - Decode the base64 image and save as PNG (optional)
      - Analyze post
      - Build final JSON response in format:
         {
           "tweet_id": "...",
           "claims": [
             {
               "content": "...",
               "is_misleading": "...",
               "explanation": "...",
               "sources": ["...", "..."]
             }
           ],
           "final_decision": true/false
         }
    """

    # check if already analyzed tweet
    response = supabase.table("tweets").select("id").eq(
        "original_tweet_id", tweet_id).execute()
    if response.data:
        analysis_response = supabase.table("analyses").select(
            "is_misleading").eq("tweet_id", tweet_id).limit(1).single().execute()

        final_decision = analysis_response.data['is_misleading'] == "misleading"

        claims_response = supabase.table("claims").select(
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
        try:
            supabase.table("tweets").insert({
                "original_tweet_id": tweet_id,
                "author": tweet_author,
                "text": tweet_text
            }).execute()

            for claim in claim_results:
                supabase.table("claims").insert({
                    "original_tweet_id": tweet_id,
                    "claim": claim["content"],
                    "sources": claim["sources"],
                    "explanation": claim["explanation"],
                    "is_misleading": "misleading" if claim["is_misleading"] else "accurate"
                }).execute()

            supabase.table("analyses").insert({
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
