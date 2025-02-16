"use server";

import groqClient from "@/lib/groq";
import { supabaseClient } from "@/lib/supabase";
import Keyword from "@/lib/types/Keyword";

export default async function generateTopThreeKeywords(data: Keyword[]) {
  // Flatten the array of arrays into a single array
  const allKeywords = data.flatMap((item) => item.keywords);

  // Count occurrences of each keyword
  const keywordCounts = allKeywords.reduce<Record<string, number>>(
    (acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    },
    {}
  );

  // Convert the counts object into an array and sort by count
  const topKeywords = Object.entries(keywordCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3) // Take the top 3
    .map(([keyword, count]) => ({ keyword, count }));

  // For each top keyword, find the most recent 3 entries in the input data
  const recentEntriesForKeywords = await Promise.all(
    topKeywords.map(async (keyword) => {
      const relevantEntries = data
        .filter((record) => record.keywords.includes(keyword.keyword))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 3); // Take the top 3 most recent entries

      // Fetch the tweet text for each relevant entry
      const entriesWithTweetText = await Promise.all(
        relevantEntries.map(async (entry) => {
          const { data: tweetData } = await supabaseClient
            .from("tweets")
            .select("text")
            .eq("original_tweet_id", entry.original_tweet_id)
            .single();

          return { ...entry, tweet_text: tweetData?.text || null };
        })
      );

      return { keyword, entries: entriesWithTweetText };
    })
  );

  return await Promise.all(
    recentEntriesForKeywords.map(
      async ({ keyword: { keyword, count }, entries }) => {
        console.log(entries.map((v) => v.tweet_text).join("\n\n"));
        const chatCompletion = await groqClient.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `
Please briefly summarize and generalize these tweets in 1-2 sentences.

Make a single summary for the tweets as a group, not individually.

Only generate one summary.`,
            },
            {
              role: "user",
              content: entries.map((v) => v.tweet_text).join("\n\n"),
            },
          ],
          model: "llama-3.1-8b-instant",
        });

        return {
          keyword,
          count,
          summary: chatCompletion.choices[0].message.content!,
        };
      }
    )
  );
}
