import { supabaseClient } from "@/lib/supabase";

type Keywords = { created_at: string; keywords: string[] }[];

type AMEdge = { source: string; target: string; weight: number };

function generateChordData(data: Keywords) {
  const MIN_THRESHOLD = 3; // Minimum co-occurrence count to include a pair

  const pairCounts: { [pair: string]: number } = {};

  // Count co-occurrences
  data.forEach((row) => {
    const keywords = [...new Set(row.keywords)].sort(); // Unique and sorted
    keywords.forEach((keyword1, i) => {
      keywords.slice(i + 1).forEach((keyword2) => {
        const pairKey = `${keyword1}|${keyword2}`;
        pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
      });
    });
  });

  // Convert pair counts to an edge list with filtering
  let edgeList: AMEdge[] = Object.entries(pairCounts)
    .filter(([, count]) => count >= MIN_THRESHOLD)
    .map(([pairKey, weight]) => {
      const [source, target] = pairKey.split("|");
      return { source, target, weight };
    });

  // Build an adjacency map to count the degree of each node
  const adjacencyMap: { [node: string]: number } = {};
  edgeList.forEach(({ source, target }) => {
    adjacencyMap[source] = (adjacencyMap[source] || 0) + 1;
    adjacencyMap[target] = (adjacencyMap[target] || 0) + 1;
  });

  // Filter out nodes with only one connection
  const validNodes = new Set(
    Object.keys(adjacencyMap).filter((node) => adjacencyMap[node] > 1)
  );

  // Filter the edge list to only include edges between valid nodes
  edgeList = edgeList.filter(
    ({ source, target }) => validNodes.has(source) && validNodes.has(target)
  );

  // Create a sorted list of unique nodes based on the filtered edges
  const uniqueNodes = Array.from(
    new Set(edgeList.flatMap(({ source, target }) => [source, target]))
  ).sort();

  // Create a node-to-index map
  const nodeIndexMap: { [node: string]: number } = {};
  uniqueNodes.forEach((node, index) => {
    nodeIndexMap[node] = index;
  });

  // Initialize a square matrix filled with 0s
  const size = uniqueNodes.length;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  // Populate the matrix with weights from the filtered edge list
  edgeList.forEach(({ source, target, weight }) => {
    const sourceIndex = nodeIndexMap[source];
    const targetIndex = nodeIndexMap[target];
    matrix[sourceIndex][targetIndex] = weight;
    matrix[targetIndex][sourceIndex] = weight; // Ensure symmetry
  });

  return { nodes: uniqueNodes, matrix };
}

function generateBubbleData(data: Keywords) {
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

function generateStackedBarData(data: Keywords) {
  // Initialize hourly buckets for the past 12 hours.
  const hourlyCounts: Record<string, Record<string, number>> = {};
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  for (let i = 0; i < 12; i++) {
    const hourDate = new Date(twelveHoursAgo.getTime() + i * 60 * 60 * 1000);
    const hourKey = hourDate.toISOString().slice(0, 13) + ":00:00";
    hourlyCounts[hourKey] = {};
  }

  // Count keywords per hour.
  data.forEach((row) => {
    const rowDate = new Date(row.created_at);
    const hourKey = rowDate.toISOString().slice(0, 13) + ":00:00";

    if (hourlyCounts[hourKey]) {
      row.keywords.forEach((keyword) => {
        hourlyCounts[hourKey][keyword] =
          (hourlyCounts[hourKey][keyword] || 0) + 1;
      });
    }
  });

  // Prepare data for the stacked bar chart.
  const stackedBarData: { hour: string; [keyword: string]: number }[] = [];

  Object.keys(hourlyCounts).forEach((hour) => {
    const top10Keywords = Object.entries(hourlyCounts[hour])
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10);

    const dataPoint: { hour: string; [keyword: string]: number } = { hour };
    top10Keywords.forEach(([keyword, count]) => {
      dataPoint[keyword] = count;
    });

    stackedBarData.push(dataPoint);
  });

  console.log(stackedBarData);
  return stackedBarData;
}

export default await async function prepareData() {
  const { data } = await supabaseClient
    .from("keywords")
    .select("keywords,created_at");

  const chordData = generateChordData(data as Keywords);
  const bubbleData = generateBubbleData(data as Keywords);
  const stackedBarData = generateStackedBarData(data as Keywords);

  return {
    chordData,
    bubbleData,
    stackedBarData,
  };
};
