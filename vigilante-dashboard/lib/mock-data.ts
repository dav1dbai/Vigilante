export function processDataForVisualizations() {
  return {
    heatmapData: [
      { keyword: "vaccine", count: 120 },
      { keyword: "election", count: 95 },
      { keyword: "climate", count: 80 },
      // Add more mock data as needed
    ],
    bubbleData: [
      { topic: "Vaccine Misinformation", flaggedTweets: 150 },
      { topic: "Election Fraud", flaggedTweets: 120 },
      { topic: "Climate Change Denial", flaggedTweets: 100 },
      // Add more mock data as needed
    ],
    timelineData: [
      { date: "2023-01-01", count: 30 },
      { date: "2023-01-02", count: 45 },
      { date: "2023-01-03", count: 50 },
      // Add more mock data as needed
    ],
  };
} 