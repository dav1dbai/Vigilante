from fastapi import APIRouter
from util.supabase import supabase_client

router = APIRouter()

@router.get("/analytics/summary")
def get_summary():
    total_tweets = supabase_client.table("tweets").select("*", count="exact").execute().count
    total_claims = supabase_client.table("claims").select("*", count="exact").execute().count

    # Count how many claims are flagged as misleading
    misleading_count = supabase_client.table("claims").select("*", count="exact").eq("is_misleading", "misleading").execute().count
    accurate_count = supabase_client.table("claims").select("*", count="exact").eq("is_misleading", "accurate").execute().count

    return {
        "total_tweets": total_tweets,
        "total_claims": total_claims,
        "misleading_claims": misleading_count,
        "accurate_claims": accurate_count
    }
