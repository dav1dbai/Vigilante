"use server";

import Keyword from "@/lib/types/Keyword";

export default async function generateStackedBarData(data: Keyword[]) {
  // Initialize hourly buckets for the past 12 hours.
  const hourlyCounts: Record<string, Record<string, number>> = {};
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  // Create buckets with labels like "11am", "3pm", etc.
  for (let i = 0; i < 12; i++) {
    const hourDate = new Date(twelveHoursAgo.getTime() + i * 60 * 60 * 1000);
    const hour = hourDate.getHours();
    const hourLabel =
      (hour % 12 === 0 ? 12 : hour % 12) + (hour < 12 ? "am" : "pm");
    hourlyCounts[hourLabel] = {};
  }

  // Count keywords per hour.
  data.forEach((row) => {
    const rowDate = new Date(row.created_at);
    const rowHour = rowDate.getHours();
    const rowHourLabel =
      (rowHour % 12 === 0 ? 12 : rowHour % 12) + (rowHour < 12 ? "am" : "pm");

    if (hourlyCounts[rowHourLabel]) {
      row.keywords.forEach((keyword) => {
        hourlyCounts[rowHourLabel][keyword] =
          (hourlyCounts[rowHourLabel][keyword] || 0) + 1;
      });
    }
  });

  // Prepare data for the stacked bar chart.
  const stackedBarData: Record<string, number | string>[] = [];

  Object.keys(hourlyCounts).forEach((hour) => {
    const top10Keywords = Object.entries(hourlyCounts[hour])
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10);

    // Skip if there are no keywords for the hour.
    if (top10Keywords.length === 0) return;

    const dataPoint: Record<string, number | string> = { hour };

    top10Keywords.forEach(([keyword, count]) => {
      dataPoint[keyword] = count;
    });

    stackedBarData.push(dataPoint);
  });

  return stackedBarData;
}
