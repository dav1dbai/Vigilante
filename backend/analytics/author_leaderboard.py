from fastapi import APIRouter
from util.supabase import supabase_client  # Ensure supabase_client is correctly imported

router = APIRouter()

@router.get("/analytics/author_leaderboard")
def get_author_leaderboard():
    # naive approach: get all tweets, group by author
    resp = supabase_client.table("tweets").select("*").execute()
    tweets = resp.data

    author_dict = {}
    for t in tweets:
        author = t["author"] or "Unknown"
        author_dict[author] = author_dict.get(author, 0) + 1
    
    # sort by count desc
    leaderboard = sorted(author_dict.items(), key=lambda x: x[1], reverse=True)
    return [{"author": a, "count": c} for a, c in leaderboard]
