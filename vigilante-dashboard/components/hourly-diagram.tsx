import { ResponsiveHeatMap } from "@nivo/heatmap";

// Generate heat map data for one week (7 days) and 24 hours
const generateHeatMapData = () => {
  const days = [
    "2021-01-01",
    "2021-01-02",
    "2021-01-03",
    "2021-01-04",
    "2021-01-05",
    "2021-01-06",
    "2021-01-07",
  ];

  const data = Array.from({ length: 24 }, (_, hour) => ({
    id: `${hour}:00`, // 'id' represents the label for each row (hour)
    data: days.map((day) => ({
      x: day, // 'x' represents the day (column)
      y: Math.floor(Math.random() * 100), // 'y' is the random value for each day/hour
    })),
  }));

  return data;
};

const HeatMapChart = () => {
  const data = generateHeatMapData();

  return (
    <div style={{ height: 500, width: 1000 }}>
      <ResponsiveHeatMap
        data={data}
        keys={data.map((item) => item.id)} // Use each hour as a key
        indexBy="id" // Use the 'id' field for rows (y-axis)
        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
        forceSquare={true}
        axisTop={{
          orient: "top",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "Days",
          legendOffset: 36,
        }}
        axisRight={null}
        axisBottom={null}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Hours",
          legendOffset: -40,
        }}
        cellOpacity={1}
        cellBorderWidth={2}
        cellBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
        animate={true}
        motionStiffness={80}
        motionDamping={9}
      />
    </div>
  );
};

export default HeatMapChart;
