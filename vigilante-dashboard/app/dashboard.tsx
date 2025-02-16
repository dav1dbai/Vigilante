import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Keyword from "@/lib/types/Keyword";
import type { JSX } from "react";
import BubbleDiagram from "./charts/bubble-diagram";
import ChordDiagram from "./charts/chord-diagram";
import StackedBarDiagram from "./charts/stacked-bar-diagram";
import LiveTweets from "./live-tweets";
import MostMisinformedTopics from "./most-misinformed-topics";
import Stats from "./stats";

interface DashboardProps {
  data: Keyword[];
}

const tabs: Record<
  string,
  [string, ({ keywords }: { keywords: Keyword[] }) => JSX.Element]
> = {
  connectedKeywords: ["Connected Keywords", ChordDiagram],
  misinformedTopics: ["Misinformed Topics", BubbleDiagram],
  keywordsTimeline: ["Common Keywords by Time", StackedBarDiagram],
};

export default function Dashboard({ data }: DashboardProps) {
  return (
    <div className="w-full flex-1 min-h-96 flex justify-center pb-8 px-8 overflow-hidden">
      <div className="w-full max-w-8xl flex-1 grid grid-cols-16 gap-8">
        <div className="col-span-6 space-y-8 flex flex-col min-h-full">
          <LiveTweets />
          <MostMisinformedTopics keywords={data} />
        </div>
        <div className="col-span-10 gap-8 flex flex-col">
          <Stats />
          <Card className="p-2 flex-1 flex">
            <Tabs
              defaultValue="misinformedTopics"
              className="flex-1 flex flex-col w-full"
            >
              <TabsList>
                {Object.entries(tabs).map(([key, value]) => (
                  <TabsTrigger key={key} value={key}>
                    {value[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex-1 flex">
                {Object.entries(tabs).map(([key, value]) => {
                  const Component = value[1];
                  return (
                    <TabsContent
                      key={key}
                      value={key}
                      className="w-full h-full"
                    >
                      <Component keywords={data} />
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
