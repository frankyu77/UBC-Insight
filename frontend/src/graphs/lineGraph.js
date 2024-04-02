import React, { Component } from 'react';
import * as d3 from 'd3';

class LineGraph extends Component {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();
    }

    componentDidMount() {
        this.createChart();
    }

    componentDidUpdate() {
        this.createChart();
    }

    createChart() {
        const { unemployment, voronoi } = this.props;
        const width = 928;
        const height = 600;
        const marginTop = 20;
        const marginRight = 20;
        const marginBottom = 30;
        const marginLeft = 30;

        const x = d3.scaleUtc()
            .domain(d3.extent(unemployment, d => d.date))
            .range([marginLeft, width - marginRight]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(unemployment, d => d.unemployment)]).nice()
            .range([height - marginBottom, marginTop]);

        const svg = d3.select(this.chartRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;");

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(voronoi ? () => {} : g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("↑ Unemployment (%)"));

        const points = unemployment.map((d) => [x(d.date), y(d.unemployment), d.division]);

        if (voronoi) svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("d", d3.Delaunay
                .from(points)
                .voronoi([0, 0, width, height])
                .render());

        const groups = d3.rollup(points, v => Object.assign(v, {z: v[0][2]}), d => d[2]);

        const line = d3.line();
        const path = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .selectAll("path")
            .data(groups.values())
            .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("d", line);

        const dot = svg.append("g")
            .attr("display", "none");

        dot.append("circle")
            .attr("r", 2.5);

        dot.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -8);

        svg
            .on("pointerenter", this.pointerentered)
            .on("pointermove", this.pointermoved)
            .on("pointerleave", this.pointerleft)
            .on("touchstart", event => event.preventDefault());

        this.svg = svg;
        this.path = path;
        this.dot = dot;
    }

    pointermoved = (event) => {
        const [xm, ym] = d3.pointer(event);
        const i = d3.leastIndex(this.points, ([x, y]) => Math.hypot(x - xm, y - ym));
        const [x, y, k] = this.points[i];
        this.path.style("stroke", ({z}) => z === k ? null : "#ddd").filter(({z}) => z === k).raise();
        this.dot.attr("transform", `translate(${x},${y})`);
        this.dot.select("text").text(k);
        this.svg.property("value", this.props.unemployment[i]).dispatch("input", {bubbles: true});
    }

    pointerentered = () => {
        this.path.style("mix-blend-mode", null).style("stroke", "#ddd");
        this.dot.attr("display", null);
    }

    pointerleft = () => {
        this.path.style("mix-blend-mode", "multiply").style("stroke", null);
        this.dot.attr("display", "none");
        this.svg.node().value = null;
        this.svg.dispatch("input", {bubbles: true});
    }

    render() {
        return <svg ref={this.chartRef}></svg>;
    }
}

export default LineGraph;
