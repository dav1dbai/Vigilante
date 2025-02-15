from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import base64

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
    tweet_text: str = Body(..., embed=True),
    base64_image: str = Body(..., embed=True)
):
    """
    Accepts:
      1) tweet_id (str)
      2) tweet_text (str)
      3) base64_image (str - PNG image in base64)

    Steps:
      - Decode the base64 image and save as PNG (optional)
      - Call Groq first: 
          -> It returns claims extracted from the tweet, along with relevant keywords
      - For each claim, call Perplexity:
          -> Decision (true/false?), explanation, and possible sources
      - Build final JSON response in format:
         {
           "tweet_id": "...",
           "claims": [
             {
               "content": "...",
               "decision": "...",
               "explanation": "...",
               "sources": ["...", "..."]
             }
           ],
           "final_decision": true/false
         }
    """

    # 1. Decode the base64 image (optional step if you actually need the image)
    try:
        image_data = base64.b64decode(base64_image)
        with open("image.png", "wb") as f:
            f.write(image_data)
    except Exception as e:
        return {
            "error": "Failed to decode and save the base64 image.",
            "details": str(e)
        }

    # 2. Call Groq to split tweet_text into claims (placeholder)
    #    We'll pretend Groq returns something like this:
    #    groq_output = {
    #      "claims": [
    #         { "content": "The sky is green", "keywords": ["sky", "green"] },
    #         { "content": "Mars is bigger than Earth", "keywords": ["Mars", "Earth"] }
    #      ]
    #    }
    groq_output = mock_groq_processing(tweet_text)

    # 3. For each claim from Groq, call Perplexity to verify/debunk (placeholder)
    #    Suppose Perplexity returns something like:
    #    {
    #       "decision": (bool) is it true?
    #       "explanation": (str)
    #       "sources": [str, ...]
    #    }
    claim_results = []
    for claim in groq_output["claims"]:
        perplexity_result = mock_perplexity_search(claim["content"], claim["keywords"])
        claim_results.append({
            "content": claim["content"],
            "decision": perplexity_result["decision"],
            "explanation": perplexity_result["explanation"],
            "sources": perplexity_result["sources"]
        })

    # 4. Compute final_decision based on all claims
    #    For instance, we might say: if any claim is false => final_decision = false
    #    Or you could do a more sophisticated approach. 
    final_decision = all(c["decision"] for c in claim_results)

    # 5. Build the final response
    final_response = {
        "tweet_id": tweet_id,
        "claims": claim_results,
        "final_decision": final_decision
    }

    return final_response


# --------------------------------------------------------------------------
# Below are mock functions to simulate Groq and Perplexity responses.
# In a real-world app, you'd make actual API calls with `requests` or `httpx`.
# --------------------------------------------------------------------------

def mock_groq_processing(tweet_text: str):
    """
    Mock function to simulate Groq splitting a tweet into claims + keywords.
    Replace with actual Groq API calls in production.
    """
    # Very naive placeholder: just pretend each sentence is a claim
    # In reality, Groq might have far more robust claim-detection logic
    sentences = tweet_text.split(".")
    claims = []
    for s in sentences:
        s = s.strip()
        if s:
            # Generate some fake keywords
            words = s.split()
            keywords = words[:2]  # just the first two words, for demonstration
            claims.append({"content": s, "keywords": keywords})
    return {"claims": claims}


def mock_perplexity_search(claim_text: str, keywords: list):
    """
    Mock function to simulate Perplexity verifying each claim.
    Replace with actual Perplexity logic / API calls.
    """
    # Example: if the claim contains "sky is green", we say it's false
    # otherwise, we say it's true. This is obviously just a placeholder.
    is_true = "sky is green" not in claim_text.lower()
    result = {
        "decision": is_true,
        "explanation": "Based on a quick check, this claim is {}.".format("true" if is_true else "false"),
        "sources": ["https://example.com/source1", "https://example.com/source2"]
    }
    return result
