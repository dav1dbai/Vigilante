import LoadingView from "@/components/loading-view";
import Keyword from "@/lib/types/Keyword";
import { BarDatum, ResponsiveBar } from "@nivo/bar";
import { useAsync } from "react-use";
import generateStackedBarData from "../api/generate-stacked-bar-data";

const calculateKeys = (data: BarDatum[]) => {
  const allKeys = new Set<string>();

  data.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      if (key !== "hour") allKeys.add(key);
    });
  });

  return Array.from(allKeys);
};

const Chart = ({ data }: { data: BarDatum[] }) => {
  return (
    <div className="h-[32rem] w-full p-8">
      <ResponsiveBar
        data={data}
        keys={calculateKeys(data)}
        indexBy="hour"
        margin={{ top: 0, right: 50, bottom: 60, left: 60 }}
        padding={0.3}
        groupMode="stacked"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 45,
          legend: "Hour",
          legendPosition: "middle",
          legendOffset: 50,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Count",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        colors={{ scheme: "nivo" }}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.6]],
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      />
    </div>
  );
};

export default function StackedBarDiagram({
  keywords,
}: {
  keywords: Keyword[];
}) {
  const { value, loading } = useAsync(
    () => generateStackedBarData(keywords),
    [keywords]
  );

  let component = null;

  if (loading) {
    component = <LoadingView text={"Loading visualization..."} />;
  }

  if (value) {
    component = <Chart data={value} />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {component}
    </div>
  );
}
