'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// 1) Import Chart.js modules
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 2) Register the modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { Line } from 'react-chartjs-2';

interface DailyData {
  date: string;
  tweet_count: number;
}

export default function TweetsByDayPage() {
  const [dailyStats, setDailyStats] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDailyStats() {
      try {
        const resp = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/analytics/tweets_by_day`
        );
        setDailyStats(resp.data.data); // data.data from your endpoint
      } catch (error) {
        console.error('Error fetching tweets_by_day:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDailyStats();
  }, []);

  if (loading) {
    return <div className="p-4 text-gray-600">Loading time-series...</div>;
  }

  const chartData = {
    labels: dailyStats.map((d) => d.date),
    datasets: [
      {
        label: 'Tweets by Day',
        data: dailyStats.map((d) => d.tweet_count),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true }  // linear scale requires registration
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tweets by Day</h1>
      <div className="w-full max-w-2xl">
        <Line data={chartData} options={options} />
      </div>
    </main>
  );
}
