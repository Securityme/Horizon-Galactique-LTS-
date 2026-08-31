import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface HistoryData {
  sol: number;
  population: number;
  energy: number;
  biomass: number;
  o2: number;
  stability: number;
  water: number;
  alloys: number;
}

interface D3ResourceChartProps {
  historyDeltas: HistoryData[];
  isLight: boolean;
}

export function D3ResourceChart({ historyDeltas, isLight }: D3ResourceChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });

  // Monitor container width for responsive design
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(300, width),
          height: 320,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !historyDeltas || historyDeltas.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawing

    const { width, height } = dimensions;
    const margin = { top: 30, right: 120, bottom: 40, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create container group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scale X - Sol / Time
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(historyDeltas, (d) => d.sol) as [number, number])
      .range([0, chartWidth]);

    // Scale Y - Find max across all three metrics to create a unified or normalized axis
    const maxVal = d3.max(historyDeltas, (d) => Math.max(d.energy, d.water, d.alloys)) || 100;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([chartHeight, 0]);

    // Gridlines
    const yGrid = d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(() => "");
    g.append("g")
      .attr("class", "grid")
      .call(yGrid)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g.selectAll(".tick line")
          .attr("stroke", isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.05)")
          .attr("stroke-dasharray", "2,2")
      );

    // X Axis
    const xAxis = d3.axisBottom(xScale).ticks(Math.min(historyDeltas.length, 10)).tickFormat((d) => `Sol ${d}`);
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis)
      .call((g) => g.select(".domain").attr("stroke", isLight ? "#cbd5e1" : "rgba(255,255,255,0.1)"))
      .call((g) =>
        g.selectAll(".tick text")
          .attr("fill", isLight ? "#475569" : "#94a3b8")
          .attr("font-family", "monospace")
          .attr("font-size", "10px")
      );

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(6);
    g.append("g")
      .call(yAxis)
      .call((g) => g.select(".domain").attr("stroke", isLight ? "#cbd5e1" : "rgba(255,255,255,0.1)"))
      .call((g) =>
        g.selectAll(".tick text")
          .attr("fill", isLight ? "#475569" : "#94a3b8")
          .attr("font-family", "monospace")
          .attr("font-size", "10px")
      );

    // Define line generator
    const createLine = (key: keyof HistoryData) => {
      return d3
        .line<HistoryData>()
        .x((d) => xScale(d.sol))
        .y((d) => yScale(d[key] as number))
        .curve(d3.curveMonotoneX);
    };

    // Color definitions
    const colors = {
      energy: "#f59e0b", // Amber
      water: "#06b6d4",  // Cyan
      alloys: "#3b82f6", // Blue
    };

    // Plot lines
    const metrics: Array<{ key: "energy" | "water" | "alloys"; label: string; color: string }> = [
      { key: "energy", label: "Énergie (GW)", color: colors.energy },
      { key: "water", label: "Eau (L)", color: colors.water },
      { key: "alloys", label: "Alliages (t)", color: colors.alloys },
    ];

    metrics.forEach(({ key, color }) => {
      g.append("path")
        .datum(historyDeltas)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("d", createLine(key));

      // Append labels at the end of each line
      if (historyDeltas.length > 0) {
        const lastPoint = historyDeltas[historyDeltas.length - 1];
        g.append("text")
          .attr("x", xScale(lastPoint.sol) + 8)
          .attr("y", yScale(lastPoint[key] as number) + 4)
          .attr("fill", color)
          .attr("font-size", "10px")
          .attr("font-family", "monospace")
          .attr("font-weight", "bold")
          .text(key === "energy" ? "Énergie" : key === "water" ? "Eau" : "Alliages");
      }
    });

    // Hover tooltip line and indicators
    const focusGroup = g.append("g").style("display", "none");

    focusGroup
      .append("line")
      .attr("class", "hover-line")
      .attr("stroke", isLight ? "#64748b" : "rgba(255, 255, 255, 0.3)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("y1", 0)
      .attr("y2", chartHeight);

    const circles = metrics.map(({ color }) => {
      return focusGroup
        .append("circle")
        .attr("r", 4)
        .attr("fill", color)
        .attr("stroke", isLight ? "#ffffff" : "#0f172a")
        .attr("stroke-width", 1.5);
    });

    // Dynamic overlay for mouse events
    const bisect = d3.bisector<HistoryData, number>((d) => d.sol).left;

    svg
      .append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("mouseover", () => focusGroup.style("display", null))
      .on("mouseout", () => focusGroup.style("display", "none"))
      .on("mousemove", function (event) {
        const coords = d3.pointer(event);
        const xPos = coords[0];
        const solVal = xScale.invert(xPos);
        const index = bisect(historyDeltas, solVal, 1);
        const d0 = historyDeltas[index - 1];
        const d1 = historyDeltas[index];
        if (!d0) return;
        const d = !d1 || solVal - d0.sol < d1.sol - solVal ? d0 : d1;

        focusGroup.attr("transform", `translate(${xScale(d.sol)},0)`);
        metrics.forEach(({ key }, i) => {
          circles[i].attr("cy", yScale(d[key] as number));
        });
      });
  }, [historyDeltas, dimensions, isLight]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Consommation & Stocks Historiques (D3.js)
        </span>
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1.5 text-amber-500">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Énergie
          </span>
          <span className="flex items-center gap-1.5 text-cyan-500">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Eau
          </span>
          <span className="flex items-center gap-1.5 text-blue-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Alloys
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`w-full rounded-xl border p-2 relative overflow-hidden ${
          isLight ? "bg-slate-50 border-slate-300" : "bg-slate-950/60 border-white/5"
        }`}
      >
        {historyDeltas.length < 2 ? (
          <div className="h-[320px] flex items-center justify-center text-slate-400 italic text-center text-[11px] font-mono">
            Enregistrement des premières métriques... (Attendez au moins 1 cycle de Sol supplémentaire)
          </div>
        ) : (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="overflow-visible block mx-auto"
          />
        )}
      </div>
    </div>
  );
}
