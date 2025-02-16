import { BarDatum, ResponsiveBar } from "@nivo/bar";

const calculateKeys = (data: BarDatum[]) => {
  const allKeys = new Set<string>();

  data.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      if (key !== "hour") allKeys.add(key);
    });
  });

  return Array.from(allKeys);
};

const StackedBarDiagram = ({ data }: { data: BarDatum[] }) => {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={data}
        keys={calculateKeys(data)}
        indexBy="hour"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        groupMode="stacked"
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 45,
          legend: "Hour",
          legendPosition: "middle",
          legendOffset: 32,
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
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
          },
        ]}
      />
    </div>
  );
};

export default StackedBarDiagram;
