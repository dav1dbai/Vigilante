import datetime
from fastapi import APIRouter
from util.supabase import supabase_client

router = APIRouter()

@router.get("/analytics/tweets_by_day")
def get_tweets_by_day():
    # Example for tweets
    # We'll do a naive grouping by date. If your data is large, you might do
    # a custom RPC or a more advanced grouping approach in Postgres.
    
    # 1) Fetch all tweets
    resp = supabase_client.table("tweets").select("*").execute()
    tweets = resp.data

    # 2) Group them by date (from created_at or timestamp)
    #    Assuming 'timestamp' is a timestamptz
    date_dict = {}
    for t in tweets:
        # parse date
        tweet_date = t["timestamp"].split("T")[0]  # YYYY-MM-DD
        date_dict[tweet_date] = date_dict.get(tweet_date, 0) + 1
    
    # convert dict to sorted list for the response
    sorted_data = sorted(date_dict.items(), key=lambda x: x[0])  # sort by date
    return {
        "data": [
            {"date": date, "tweet_count": count} for (date, count) in sorted_data
        ]
    }
