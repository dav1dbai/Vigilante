import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import { scaleLog } from "d3-scale";

const BubbleDiagram = ({ data }: { data: [string, number][] }) => {
  // Extract all values to determine the min and max for the color scale
  const values = data.map(([, value]) => value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  console.log(data);

  // Create a linear color scale that maps the size to a color range.
  // Here, smaller bubbles will be a light color and larger bubbles a darker color.
  const colorScale = scaleLog<string>()
    .domain([minValue, maxValue])
    .range(['#F2DD7890', '#4ECDC4', '#45B7D180', '#96CEB480', '#FFEEAD80']);


  return (
    <div style={{ height: 500 }}>
      <ResponsiveCirclePacking
        data={{
          name: "root",
          children: data.map(([name, value]) => ({ name, value })),
        }}
        id="name"
        value="value"
        // Use a custom color function that determines the color based on the bubble's value.
        colors={(node) => colorScale(node.value)}

        padding={4}
        labelTextColor="#F5F5F5"  // Changed to white

        //labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
        leavesOnly
        enableLabels
        
      />
    </div>
  );
};

export default BubbleDiagram;
