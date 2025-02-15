'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// 1) Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 2) Register the components for global usage
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { Bar } from 'react-chartjs-2';

interface SummaryData {
  total_tweets: number;
  total_claims: number;
  misleading_claims: number;
  accurate_claims: number;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const resp = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/analytics/summary`
        );
        setSummary(resp.data);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="p-4 text-gray-600">Loading summary...</div>;
  }

  if (!summary) {
    return <div className="p-4 text-red-600">No summary data found</div>;
  }

  const chartData = {
    labels: ['Tweets', 'Claims', 'Misleading', 'Accurate'],
    datasets: [
      {
        label: 'Counts',
        data: [
          summary.total_tweets,
          summary.total_claims,
          summary.misleading_claims,
          summary.accurate_claims,
        ],
        backgroundColor: ['#ffc107', '#17a2b8', '#dc3545', '#28a745'],
      },
    ],
  };

  const options = { responsive: true };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Analytics Summary</h1>
      <div className="max-w-sm">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 space-y-2">
        <p><strong>Total Tweets:</strong> {summary.total_tweets}</p>
        <p><strong>Total Claims:</strong> {summary.total_claims}</p>
        <p><strong>Misleading Claims:</strong> {summary.misleading_claims}</p>
        <p><strong>Accurate Claims:</strong> {summary.accurate_claims}</p>
      </div>
    </main>
  );
}
