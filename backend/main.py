from typing import Optional
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from helpers.post import analyze_post, check_semantic_relevance
from analytics.analytics import router as analytics_router  # Import analytics router
from pydantic import BaseModel


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

class TweetData(BaseModel):
    tweet_id: str
    tweet_author: str
    tweet_text: str
    base64_image: Optional[str] = None
    timestamp: str

@app.post("/analyze_tweet")
async def analyze_tweet_endpoint(tweet_data: TweetData):
    # IMPORTANT: Await the analyze_post result so that we return the actual data
    result = await analyze_post(
        tweet_id=tweet_data.tweet_id,
        tweet_author=tweet_data.tweet_author,
        tweet_text=tweet_data.tweet_text,
        base64_image=tweet_data.base64_image,
        timestamp=tweet_data.timestamp,
        save_to_supabase=True,
    )
    return result


@app.post("/semantic_filter")
def semantic_filter(
    description: str = Body(..., embed=True),
    tweet_text: str = Body(..., embed=True)
):
  print(f"Checking semantic relevance for: {description}, {tweet_text}")
  return check_semantic_relevance(description, tweet_text)