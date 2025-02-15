from fastapi import APIRouter
from analytics.author_leaderboard import get_author_leaderboard
from analytics.claims import list_claims
from analytics.summary import get_summary
from analytics.tweets_by_day import get_tweets_by_day
router = APIRouter()

# Include the analytics endpoints
router.add_api_route("/author_leaderboard", get_author_leaderboard, methods=["GET"])
router.add_api_route("/claims", list_claims, methods=["GET"])
router.add_api_route("/summary", get_summary, methods=["GET"])
router.add_api_route("/tweets_by_day", get_tweets_by_day, methods=["GET"])