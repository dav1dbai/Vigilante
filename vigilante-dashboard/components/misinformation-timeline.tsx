// "use client"

// import { useEffect, useRef } from "react"
// import * as d3 from "d3"

// interface TimelineData {
//   date: Date
//   claim: string
//   category: string
//   frequency: number
// }

// interface MisinformationTimelineProps {
//   data: TimelineData[]
// }

// export default function MisinformationTimeline({ data }: MisinformationTimelineProps) {
//   const svgRef = useRef<SVGSVGElement>(null)

//   useEffect(() => {
//     if (!svgRef.current || !data.length) return

//     const margin = { top: 40, right: 100, bottom: 60, left: 60 }
//     const width = 1000 - margin.left - margin.right
//     const height = 500 - margin.top - margin.bottom

//     // Clear existing SVG
//     d3.select(svgRef.current).selectAll("*").remove()

//     const svg = d3
//       .select(svgRef.current)
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`)

//     // Create scales
//     const x = d3
//       .scaleTime()
//       .domain(d3.extent(data, (d) => d.date) as [Date, Date])
//       .range([0, width])

//     const y = d3
//       .scaleLinear()
//       .domain([0, d3.max(data, (d) => d.frequency) || 0])
//       .range([height, 0])

//     const color = d3.scaleOrdinal(d3.schemeCategory10)

//     // Create line generator
//     const line = d3
//       .line<TimelineData>()
//       .x((d) => x(d.date))
//       .y((d) => y(d.frequency))
//       .curve(d3.curveMonotoneX)

//     // Group data by category
//     const categories = Array.from(new Set(data.map((d) => d.category)))
//     const groupedData = categories.map((category) => ({
//       category,
//       values: data.filter((d) => d.category === category),
//     }))

//     // Add X axis
//     svg
//       .append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(x))
//       .selectAll("text")
//       .style("fill", "#fff")

//     // Add Y axis
//     svg.append("g").call(d3.axisLeft(y)).selectAll("text").style("fill", "#fff")

//     // Add lines
//     const lines = svg
//       .selectAll(".line")
//       .data(groupedData)
//       .enter()
//       .append("path")
//       .attr("class", "line")
//       .attr("d", (d) => line(d.values))
//       .style("stroke", (d) => color(d.category))
//       .style("fill", "none")
//       .style("stroke-width", 2)

//     // Add dots
//     groupedData.forEach((group) => {
//       svg
//         .selectAll(`.dots-${group.category.replace(/\s+/g, "-")}`)
//         .data(group.values)
//         .enter()
//         .append("circle")
//         .attr("cx", (d) => x(d.date))
//         .attr("cy", (d) => y(d.frequency))
//         .attr("r", 5)
//         .style("fill", color(group.category))
//         .on("mouseover", function (event, d) {
//           d3.select(this).attr("r", 8)

//           tooltip
//             .style("opacity", 1)
//             .html(`Date: ${d.date.toLocaleDateString()}<br>
//                   Claim: ${d.claim}<br>
//                   Category: ${d.category}<br>
//                   Frequency: ${d.frequency}`)
//             .style("left", `${event.pageX + 10}px`)
//             .style("top", `${event.pageY - 10}px`)
//         })
//         .on("mouseout", function () {
//           d3.select(this).attr("r", 5)
//           tooltip.style("opacity", 0)
//         })
//     })

//     // Add legend
//     const legend = svg
//       .append("g")
//       .attr("font-family", "sans-serif")
//       .attr("font-size", 10)
//       .attr("text-anchor", "start")
//       .selectAll("g")
//       .data(categories)
//       .enter()
//       .append("g")
//       .attr("transform", (d, i) => `translate(${width + 10},${i * 20})`)

//     legend.append("rect").attr("x", 0).attr("width", 19).attr("height", 19).attr("fill", color)

//     legend
//       .append("text")
//       .attr("x", 24)
//       .attr("y", 9.5)
//       .attr("dy", "0.32em")
//       .style("fill", "#fff")
//       .text((d) => d)

//     // Add title
//     svg
//       .append("text")
//       .attr("x", width / 2)
//       .attr("y", -margin.top / 2)
//       .attr("text-anchor", "middle")
//       .style("fill", "#fff")
//       .style("font-size", "16px")
//       .text("Misinformation Claims Timeline")

//     // Create tooltip
//     const tooltip = d3
//       .select("body")
//       .append("div")
//       .style("position", "absolute")
//       .style("background-color", "rgba(0, 0, 0, 0.8)")
//       .style("padding", "10px")
//       .style("border-radius", "5px")
//       .style("color", "#fff")
//       .style("font-size", "12px")
//       .style("opacity", 0)

//     return () => {
//       tooltip.remove()
//     }
//   }, [data])

//   return (
//     <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
//       <svg ref={svgRef}></svg>
//     </div>
//   )
// }

