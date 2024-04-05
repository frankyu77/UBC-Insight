import React, { Component } from 'react';
import * as d3 from 'd3';

class PieChart extends Component {
    constructor(props) {
        console.log(1);
        super(props);
        console.log(2);
        this.createPieChart = this.createPieChart.bind(this);
        console.log(3);
    }

    componentDidMount() {
        this.createPieChart();
    }

    componentDidUpdate() {
        this.createPieChart();
    }

    createPieChart() {
        const { data, datasetID } = this.props;

        const resultMap = data.reduce((acc, item) => {
            acc[item[`${datasetID}_dept`]] = item.count;
            return acc;
        }, {});

        const width = 450, height = 450, margin = 40;
        const radius = Math.min(width, height) / 2 - margin;

        // Clean up previous SVG (if any)
        d3.select(this.refs.chart).select("svg").remove();

        const svg = d3.select(this.refs.chart)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeSet2);

        const pie = d3.pie().value(d => d[1]);
        const data_ready = pie(Object.entries(resultMap));

        const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

        svg.selectAll('path')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', d => color(d.data[0]))
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7);

        svg.selectAll('text')
            .data(data_ready)
            .enter()
            .append('text')
            .text(d => `${d.data[0]}`)
            .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
            .style("text-anchor", "middle")
            .style("font-size", 17);
    }

    render() {
        return <div ref="chart" />;
    }
}

export default PieChart;
