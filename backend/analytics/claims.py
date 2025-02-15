from fastapi import APIRouter, Query
from util.supabase import supabase_client

router = APIRouter()

@router.get("/analytics/claims")
def list_claims(limit: int = 50, offset: int = 0):
    """
    Returns a paginated list of claims.
    """
    resp = (supabase_client
            .table("claims")
            .select("*")
            .range(offset, offset + limit - 1)
            .execute())
    
    return resp.data
