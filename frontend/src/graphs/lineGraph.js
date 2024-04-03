import React, { Component } from 'react';
import * as d3 from 'd3';

class LineGraph extends Component {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();
        this.createChart();
    }

    componentDidMount() {
        this.createChart();
    }

    componentDidUpdate() {
        this.createChart();
    }

    createChart() {
        const { data } = this.props; // Extract data from props
        const width = 928;
        const height = 600;
        const marginTop = 20;
        const marginRight = 20;
        const marginBottom = 30;
        const marginLeft = 30;

        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.sections_year))
            .range([marginLeft, width - marginRight]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sumFail)]).nice()
            .range([height - marginBottom, marginTop]);

        const svg = d3.select(this.chartRef.current)
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("*").remove();

        const xAxis = d3.axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
            .tickFormat(d3.format("d")); // Format ticks as integers

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("↑ Number of Fails"));

        const line = d3.line()
            .x(d => x(d.sections_year))
            .y(d => y(d.sumFail));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        this.svg = svg;
    }

    render() {
        return <svg ref={this.chartRef}></svg>;
    }
}

export default LineGraph;
