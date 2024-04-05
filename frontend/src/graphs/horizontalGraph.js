import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HorizontalGraph = ({ alphabet: dataset, datasetID }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!dataset.length) return;

        const barHeight = 25;
        const marginTop = 30;
        const marginRight = 50;
        const marginBottom = 10;
        const marginLeft = 50;
        const width = 928;
        const height = Math.ceil((dataset.length + 0.1) * barHeight) + marginTop + marginBottom;

        const x = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d.overallAvg / 100)])
            .range([marginLeft, width - marginRight]);

        const y = d3.scaleBand()
            .domain(d3.sort(dataset, d => -d.overallAvg).map(d => d[`${datasetID}_dept`]))
            .rangeRound([marginTop, height - marginBottom])
            .padding(0.1);

        const formatPercent = d3.format(".2%");

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

        svg.append("g")
            .attr("fill", "steelblue")
            .selectAll()
            .data(dataset)
            .join("rect")
            .attr("x", x(0))
            .attr("y", (d) => y(d[`${datasetID}_dept`]))
            .attr("width", (d) => x(d.overallAvg / 100) - x(0))
            .attr("height", y.bandwidth());

        svg.append("g")
            .attr("fill", "white")
            .attr("text-anchor", "end")
            .selectAll()
            .data(dataset)
            .join("text")
            .attr("x", (d) => x(d.overallAvg / 100))
            .attr("y", (d) => y(d[`${datasetID}_dept`] + y.bandwidth() / 2))
            .attr("dy", "0.35em")
            .attr("dx", -4)
            .text((d) => formatPercent(d.overallAvg / 100))
            .call((text) => text.filter(d => x(d.overallAvg) - x(0) < 20) // short bars
                .attr("dx", +4)
                .attr("fill", "black")
                .attr("text-anchor", "start"));

        svg.append("g")
            .attr("transform", `translate(0,${marginTop})`)
            .call(d3.axisTop(x).tickFormat(formatPercent))
            .call(g => g.select(".domain").remove());

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickSizeOuter(0));
    }, [dataset]);

    return <svg ref={svgRef}></svg>;
};

export default HorizontalGraph;
