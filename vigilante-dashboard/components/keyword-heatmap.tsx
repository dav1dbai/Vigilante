"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface KeywordData {
  keyword: string
  category: string
  frequency: number
}

interface KeywordHeatmapProps {
  data: KeywordData[]
  colorScheme: string
}

export default function KeywordHeatmap({ data, colorScheme }: KeywordHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const margin = { top: 40, right: 40, bottom: 60, left: 100 }
    const width = 800 - margin.left - margin.right
    const height = 500 - margin.top - margin.bottom

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create scales
    const keywords = Array.from(new Set(data.map((d) => d.keyword)))
    const categories = Array.from(new Set(data.map((d) => d.category)))

    const x = d3.scaleBand().range([0, width]).domain(categories).padding(0.05)

    const y = d3.scaleBand().range([height, 0]).domain(keywords).padding(0.05)

    const color = d3
      .scaleSequential()
      .interpolator(d3.interpolateInferno)
      .domain([0, d3.max(data, (d) => d.frequency) || 0])

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)")
      .style("fill", "#fff")

    // Add Y axis
    svg.append("g").call(d3.axisLeft(y)).selectAll("text").style("fill", "#fff")

    // Create the heatmap cells
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.category) || 0)
      .attr("y", (d) => y(d.keyword) || 0)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", (d) => color(d.frequency))
      .style("opacity", 0.8)
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 1)

        // Show tooltip
        tooltip
          .style("opacity", 1)
          .html(`Keyword: ${d.keyword}<br>Category: ${d.category}<br>Frequency: ${d.frequency}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 0.8)
        tooltip.style("opacity", 0)
      })

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-size", "16px")
      .text("Keyword Frequency Heatmap")

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("color", "#fff")
      .style("font-size", "12px")
      .style("opacity", 0)

    return () => {
      tooltip.remove()
    }
  }, [data])

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
      <svg ref={svgRef}></svg>
    </div>
  )
}

