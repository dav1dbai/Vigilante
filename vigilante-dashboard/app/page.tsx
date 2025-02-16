import Dashboard from "@/components/dashboard";
import prepareData from "./api/prepare-data";

export default async function Home() {
  // Define the fake data here
  const data = await prepareData();

  console.log(data.chordData);

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-8">Misinformation Dashboard</h1>
      <Dashboard data={data} />
    </main>
  );
}
