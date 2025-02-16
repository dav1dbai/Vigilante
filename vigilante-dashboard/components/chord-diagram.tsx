// import * as d3 from "d3";
// import React, { useEffect, useRef } from "react";

// interface ChordDiagramProps {
//   data: number[][];
//   labels: string[];
//   width?: number;
//   height?: number;
// }

// const ChordDiagram: React.FC<ChordDiagramProps> = ({
//   data,
//   labels,
//   width = 600,
//   height = 600,
// }) => {
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   useEffect(() => {
//     if (!svgRef.current) return;

//     // Clear previous SVG content
//     d3.select(svgRef.current).selectAll("*").remove();

//     // Define dimensions and radius
//     const outerRadius = Math.min(width, height) / 2 - 40;
//     const innerRadius = outerRadius - 30;

//     // Create chord layout
//     const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);

//     // Create arc generator
//     const arc = d3
//       .arc<d3.PieArcDatum<any>>()
//       .innerRadius(innerRadius)
//       .outerRadius(outerRadius);

//     // Create ribbon generator
//     const ribbon = d3.ribbon().radius(innerRadius);

//     // Create color scale
//     const color = d3.scaleOrdinal(d3.schemeCategory10);

//     // Compute chord layout
//     const chords = chord(data);

//     // Append the SVG container
//     const svg = d3
//       .select(svgRef.current)
//       .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
//       .append("g");

//     // Create a tooltip
//     const tooltip = d3
//       .select("body")
//       .append("div")
//       .style("position", "absolute")
//       .style("padding", "8px")
//       .style("background", "rgba(0, 0, 0, 0.7)")
//       .style("color", "white")
//       .style("border-radius", "4px")
//       .style("pointer-events", "none")
//       .style("opacity", 0);

//     // Append groups (outer arcs)
//     const group = svg
//       .append("g")
//       .selectAll("g")
//       .data(chords.groups)
//       .enter()
//       .append("g");

//     group
//       .append("path")
//       .style("fill", (d) => color(d.index.toString())!)
//       .style("stroke", (d) =>
//         d3.rgb(color(d.index.toString())!).darker().toString()
//       )
//       .attr("d", arc);

//     // Append ribbons (inner chords)
//     svg
//       .append("g")
//       .selectAll("path")
//       .data(chords)
//       .enter()
//       .append("path")
//       .attr("d", ribbon)
//       .style("fill", (d) => color(d.target.index.toString())!)
//       .style("stroke", (d) =>
//         d3.rgb(color(d.target.index.toString())!).darker().toString()
//       )
//       .on("mouseover", function (event, d) {
//         tooltip
//           .style("opacity", 1)
//           .html(
//             `<strong>${labels[d.source.index]}</strong> → <strong>${
//               labels[d.target.index]
//             }</strong>`
//           )
//           .style("left", `${event.pageX + 10}px`)
//           .style("top", `${event.pageY + 10}px`);
//       })
//       .on("mousemove", (event) => {
//         tooltip
//           .style("left", `${event.pageX + 10}px`)
//           .style("top", `${event.pageY + 10}px`);
//       })
//       .on("mouseout", () => {
//         tooltip.style("opacity", 0);
//       });
//   }, [data, labels, width, height]);

//   return <svg ref={svgRef} />;
// };

// export default ChordDiagram;

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
