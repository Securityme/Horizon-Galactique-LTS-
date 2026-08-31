import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface HistoryDataPoint {
  sol: number;
  population: number;
  energy: number;
  biomass: number;
  o2: number;
  stability: number;
}

interface TelemetryChartProps {
  data: HistoryDataPoint[];
}

export function TelemetryChart({ data }: TelemetryChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length < 2) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 600;
    const height = 220;
    const margin = { top: 20, right: 30, bottom: 30, left: 45 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.sol) as [number, number])
      .range([0, innerWidth]);

    const maxVal = d3.max(data, (d) => Math.max(d.stability, d.population / 20, d.energy, d.o2 / 500)) || 100;
    const yScale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([innerHeight, 0]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("stroke", "rgba(255,255,255,0.06)")
      .attr("stroke-dasharray", "2,2")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => ""));

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(Math.min(data.length, 8)).tickFormat((d) => `Sol ${d}`);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .attr("color", "#64748b")
      .call(xAxis)
      .selectAll("text")
      .style("font-family", "monospace")
      .style("font-size", "10px");

    g.append("g")
      .attr("color", "#64748b")
      .call(yAxis)
      .selectAll("text")
      .style("font-family", "monospace")
      .style("font-size", "10px");

    // Line generators
    const stabilityLine = d3
      .line<HistoryDataPoint>()
      .x((d) => xScale(d.sol))
      .y((d) => yScale(d.stability))
      .curve(d3.curveMonotoneX);

    const energyLine = d3
      .line<HistoryDataPoint>()
      .x((d) => xScale(d.sol))
      .y((d) => yScale(d.energy))
      .curve(d3.curveMonotoneX);

    const o2Line = d3
      .line<HistoryDataPoint>()
      .x((d) => xScale(d.sol))
      .y((d) => yScale(d.o2 / 500))
      .curve(d3.curveMonotoneX);

    // Render Lines
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#c084fc") // purple for stability
      .attr("stroke-width", 2)
      .attr("d", stabilityLine);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#fbbf24") // amber for energy
      .attr("stroke-width", 2)
      .attr("d", energyLine);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#22d3ee") // cyan for O2 index
      .attr("stroke-width", 2)
      .attr("d", o2Line);

    // Glowing dots at last point
    const last = data[data.length - 1];
    if (last) {
      g.append("circle")
        .attr("cx", xScale(last.sol))
        .attr("cy", yScale(last.stability))
        .attr("r", 4)
        .attr("fill", "#c084fc");

      g.append("circle")
        .attr("cx", xScale(last.sol))
        .attr("cy", yScale(last.energy))
        .attr("r", 4)
        .attr("fill", "#fbbf24");

      g.append("circle")
        .attr("cx", xScale(last.sol))
        .attr("cy", yScale(last.o2 / 500))
        .attr("r", 4)
        .attr("fill", "#22d3ee");
    }
  }, [data]);

  return (
    <div className="w-full bg-slate-950/80 rounded-xl p-3 border border-white/10 flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono px-2">
        <span className="text-cyan-400 font-bold">COURBES VECTORIELLES D3 TÉLÉMÉTRIE MULTI-SOLS</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-purple-300">
            <span className="w-2.5 h-0.5 bg-purple-400 inline-block" /> Stabilité (%)
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> Énergie (GW)
          </span>
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> O₂ (x500L)
          </span>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-56 text-slate-400" />
    </div>
  );
}
