import { supabaseClient } from "@/lib/supabase";
import Keyword from "@/lib/types/Keyword";

export default async function getAllKeywordsEntries() {
  let allData: Keyword[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data } = await supabaseClient
      .from<"keywords", Keyword>("keywords")
      .select("keywords,created_at,original_tweet_id")
      .range(from, to);

    allData = allData.concat(data || []);
    from += 1000;
    to += 1000;

    // Stop fetching if less than 1000 rows are returned
    if ((data || []).length < 1000) {
      hasMore = false;
    }
  }

  return allData;
}
