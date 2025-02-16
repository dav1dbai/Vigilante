"use server";

import Keyword from "@/lib/types/Keyword";

export default async function generateBubbleData(data: Keyword[]) {
  // Flatten the array of arrays and count occurrences
  const wordCounts: Record<string, number> = {};
  data.forEach((row) => {
    row.keywords.forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });

  // Convert counts to an array and sort by frequency
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .slice(0, 15); // Get the top 15

  return sortedWords;
}
