from typing import Optional
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import base64

from helpers.post import evaluate_claims_in_post

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

    response = {
        "tweet_id": tweet_id,
        "claims": claim_results,
        "final_decision": final_decision
    }

    return response
