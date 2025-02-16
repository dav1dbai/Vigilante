import Dashboard from "@/components/dashboard";
import prepareData from "./api/prepare-data";

export default async function Home() {
  // Define the fake data here
  const data = await prepareData();

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl text-gray-500 font-bold mb-8 text-center">Misinformation Dashboard</h1>
      <Dashboard data={data} /> 
    </main>
  );
}
