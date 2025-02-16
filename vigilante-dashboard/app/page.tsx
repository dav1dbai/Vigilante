import Image from "next/image";
import Dashboard from "@/components/dashboard";

export default function Home() {
  // Define the fake data here
  const fakeData = [
    { topic: "COVID-19 Vaccines", flaggedTweets: 120 },
    { topic: "Climate Change", flaggedTweets: 95 },
    { topic: "Election Fraud", flaggedTweets: 150 },
    { topic: "5G Technology", flaggedTweets: 80 },
    { topic: "Health Misinformation", flaggedTweets: 110 },
    { topic: "Cryptocurrency Scams", flaggedTweets: 70 },
    { topic: "Fake News", flaggedTweets: 200 },
    { topic: "Conspiracy Theories", flaggedTweets: 130 },
    { topic: "Political Misinformation", flaggedTweets: 160 },
    { topic: "Social Media Influence", flaggedTweets: 90 },
    { topic: "Vaccine Side Effects", flaggedTweets: 140 },
    { topic: "Nutrition Myths", flaggedTweets: 60 },
    { topic: "Pandemic Preparedness", flaggedTweets: 75 },
    { topic: "Data Privacy", flaggedTweets: 50 },
    { topic: "Artificial Intelligence", flaggedTweets: 85 },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-8">Misinformation Dashboard</h1>
      <Dashboard data={fakeData} />
    </main>
  );
}
