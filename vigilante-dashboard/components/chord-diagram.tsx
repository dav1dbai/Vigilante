import { ResponsiveChord } from "@nivo/chord";

const ChordDiagram = ({
  data,
}: {
  data: { matrix: number[][]; nodes: string[] };
}) => {
  return (
    <div style={{ height: 600 }}>
      <ResponsiveChord
        data={data.matrix}
        keys={data.nodes}
        margin={{ top: 60, right: 60, bottom: 90, left: 60 }}
        padAngle={0.02}
        innerRadiusRatio={0.96}
        arcOpacity={.9}
        arcBorderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
        ribbonOpacity={0.75}
        ribbonBorderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
        colors={{ scheme: "nivo" }}
        animate={true}
        labelRotation={-90}
      />
    </div>
  );
};

export default ChordDiagram;
