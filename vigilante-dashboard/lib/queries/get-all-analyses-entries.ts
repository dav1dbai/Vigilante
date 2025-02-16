import { supabaseClient } from "@/lib/supabase";

export default async function getAllAnalysesEntries() {
  let allData: unknown[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data } = await supabaseClient
      .from("analyses")
      .select("original_tweet_id,is_misleading")
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
