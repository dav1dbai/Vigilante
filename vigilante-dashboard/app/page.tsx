"use client";

import Header from "@/components/header";
import useSWR from "swr";
import getAllKeywordsEntries from "../lib/queries/get-all-keywords-entries";

import LoadingView from "@/components/loading-view";
import Dashboard from "./dashboard";

export default function Home() {
  // Define the fake data here
  //const data = await prepareData();

  const { data, isLoading, error } = useSWR("/", getAllKeywordsEntries, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  console.log(data, isLoading, error);

  return (
    <>
      <Header />
      {isLoading && <LoadingView text={"Loading data..."} />}
      {data && <Dashboard data={data} />}
    </>
  );
}
