from typing import Optional
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from helpers.post import analyze_post, check_semantic_relevance
from analytics.analytics import router as analytics_router  # Import analytics router


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

app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])

@app.post("/analyze_tweet")
def analyze_tweet(
    tweet_id: str = Body(..., embed=True),
    tweet_author: str = Body(..., embed=True),
    tweet_text: str = Body(..., embed=True),
    base64_image: Optional[str] = Body(None, embed=True),
    timestamp: str = Body(..., embed=True)
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
    print(f"Analyzing tweet with data: {tweet_id}, {tweet_author}, {tweet_text}")
    return analyze_post(tweet_id, tweet_author, tweet_text, base64_image, timestamp)


@app.post("/semantic_filter")
def semantic_filter(
    description: str = Body(..., embed=True),
    tweet_text: str = Body(..., embed=True)
):
  print(f"Checking semantic relevance for: {description}, {tweet_text}")
  return check_semantic_relevance(description, tweet_text)