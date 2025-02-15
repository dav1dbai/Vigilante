// "use client"

// import { useEffect, useRef } from "react"
// import * as d3 from "d3"

// interface BubbleVisualizationProps {
//   data: {
//     topic: string
//     flaggedTweets: number
//   }[]
// }

// interface HierarchyNodeData {
//   name: string
//   children: {
//     topic: string
//     flaggedTweets: number
//   }[]
// }

// export default function BubbleVisualization({ data }: BubbleVisualizationProps) {
//   const svgRef = useRef<SVGSVGElement>(null)

//   useEffect(() => {
//     if (!svgRef.current) return

//     // Clear any existing SVG content
//     d3.select(svgRef.current).selectAll("*").remove()

//     const svg = d3.select(svgRef.current)
//     const width = 800
//     const height = 400

//     svg.attr("width", width).attr("height", height)

//     const bubble = d3.pack().size([width, height]).padding(1)

//     // Create a hierarchical structure with a root node
//     const hierarchicalData: HierarchyNodeData = {
//       name: "root",
//       children: data.map(d => ({ topic: d.topic, flaggedTweets: d.flaggedTweets })),
//     }

//     const root = d3.hierarchy<HierarchyNodeData>(hierarchicalData)
//       .sum(d => d.flaggedTweets)

//     const nodes = bubble(root).descendants().slice(1) // slice(1) removes the root node

//     const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
//       .domain([0, d3.max(data, d => d.flaggedTweets) || 0])

//     const node = svg
//       .selectAll<SVGGElement, d3.HierarchyCircularNode<{ topic: string; flaggedTweets: number }>>(".node")
//       .data(nodes)
//       .enter()
//       .append("g")
//       .attr("class", "node")
//       .attr("transform", d => `translate(${d.x},${d.y})`)

//     node
//       .append("circle")
//       .attr("r", d => d.r)
//       .style("fill", d => colorScale((d.data as { topic: string; flaggedTweets: number }).flaggedTweets))
//       .style("opacity", 0.7)

//     node
//       .append("text")
//       .attr("dy", ".3em")
//       .style("text-anchor", "middle")
//       .style("font-size", d => `${d.r / 3}px`)
//       .style("fill", "white")
//       .text(d => (d.data as { topic: string; flaggedTweets: number }).topic.substring(0, d.r / 3))

//     node
//       .append("title")
//       .text(d => `${(d.data as { topic: string; flaggedTweets: number }).topic}\nFlagged Tweets: ${(d.data as { topic: string; flaggedTweets: number }).flaggedTweets}`)
//   }, [data])

//   return (
//     <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
//       <h2 className="text-xl font-semibold mb-4">Top 15 Misinformation Topics</h2>
//       <svg ref={svgRef}></svg>
//     </div>
//   )
// }