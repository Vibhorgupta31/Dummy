// panning & zooming timeseries chart
class D3_Timeseries extends D3_Timechart{

    constructor(container_id, plot_height, coordinator) {
        super(container_id, plot_height, coordinator);

        // create the svg for this chart
        this.svg = d3.select(".svg_vis_container")
            .append("svg")
                .attr("y", 120)
                .attr("class", "svg_" + container_id)
                .attr("width", this.plot_width)
                .attr("height", this.plot_height);
    }

    // inherits from D3_Timechart
    drawAxes(line_datas){
        super.drawAxes(line_datas); // do all the parent stuff

        // console.log("this.x_domain"); console.log(this.x_domain);

        // draw the x_scale label
        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", (this.x_scale(this.x_domain[1])) / 2)
            .attr("y", this.plot_height - 10)
            .style("text-anchor", "middle")
            .text("Reporting Date");

        // draw the Y axis
        this.svg.append("g")
            .attr("class", "axis-line")
            .attr("transform", "translate(" + this.margin + ", 0)")
            .call(d3.axisLeft(this.y_scale_left));

        // draw the Y label
        this.svg.append("text")
            .attr("transform", "rotate(90)")
            .attr("class", "axis-label")
            .attr("x", (this.y_scale_left(this.y_domain[0])) / 2)
            .attr("y", 0)
            .style("text-anchor", "middle")
            .text(this.getYAxisLabel());

        // right-side y-axis
        if(line_datas.line_data_3.data !== undefined) {
            // draw the second Y axis
            this.svg.append("g")
                .attr("class", "axis-line")
                .attr("transform", "translate(" + (this.plot_width - this.margin) + ", 0)")
                .call(d3.axisRight(this.y_scale_right));

            this.svg.append("text")
                .attr("transform", "rotate(90)")
                .attr("class", "axis-label")
                .attr("color", "purple")
                .attr("x", (this.y_scale_left(this.y_domain[0])) / 2)
                .attr("y", this.margin - this.plot_width - this.margin + 10)
                .style("text-anchor", "middle")
                .text("Percentage");
        }

        // chart title
        this.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", (this.x_scale(this.x_domain[1])) / 2)
            .attr("y", 15)
            .style("text-anchor", "middle")
            .text("Timeseries of " + this.getChartTitle());
    }

    // inherits from D3_Timechart
    drawLines(line_datas){
        // console.log("drawLines(line_data)"); console.log(line_data);
        super.drawLines(line_datas); // do all the parent stuff

        if(line_datas.line_data.data !== undefined) {
            let dots = this.svg.selectAll(".dot").data(line_datas.line_data.data);
            dots.enter().append("circle")
                .attr("class", "dot")
                .attr("cx", d => this.x_scale(d[0]))
                .attr("cy", d => this.y_scale_left(d[1]))
                .attr("r", 2)
                .style("fill", "steelblue")
                .style("stroke", "none")
                .attr("data-tippy-content", d => {
                    let html = "<table>";
                    html += "<tr><th>Date:</th><td>" + this.coordinator.formatDate(d[0]) + "</td></tr>"
                    html += "<tr><th>" + this.getDataPointInfo(line_datas.line_data.tag) + ":</th><td>" +
                        this.coordinator.formatFloat(d[1]) + "</td></tr>"
                    return html;
                })
                .call(selection => tippy(selection.nodes(), {allowHTML: true}));
        }

        if(line_datas.line_data_2.data !== undefined) {
            let dots2 = this.svg.selectAll(".dot2").data(line_datas.line_data_2.data);
            dots2.enter().append("circle")
                .attr("class", "dot2")
                .attr("cx", d => this.x_scale(d[0]))
                .attr("cy", d => this.y_scale_left(d[1]))
                .attr("r", 2)
                .style("fill", "darkblue")
                .style("stroke", "none")
                .attr("data-tippy-content", d => {
                    let html = "<table>";
                    html += "<tr><th>Date:</th><td>" +  this.coordinator.formatDate(d[0]) + "</td></tr>"
                    html += "<tr><th>" + this.getDataPointInfo(line_datas.line_data_2.tag) + ":</th><td>" +
                        this.coordinator.formatFloat(d[1]) + "</td></tr>"
                    return html;
                })
                .call(selection => tippy(selection.nodes(), {allowHTML: true}));
        }

        if(line_datas.line_data_3.data !== undefined) {
            let dots3 = this.svg.selectAll(".dot3").data(line_datas.line_data_3.data);
            dots3.enter().append("circle")
                .attr("class", "dot3")
                .attr("cx", d => this.x_scale(d[0]))
                .attr("cy", d => this.y_scale_right(d[1]))
                .attr("r", 2)
                .style("fill", "purple")
                .style("stroke", "none")
                .attr("data-tippy-content", d => {
                    let html = "<table>";
                    html += "<tr><th>Date:</th><td>" +  this.coordinator.formatDate(d[0]) + "</td></tr>"
                    html += "<tr><th>" + this.getDataPointInfo(line_datas.line_data_3.tag) + ":</th><td>" +
                        this.coordinator.formatFloat(d[1]) + "</td></tr>"
                    return html;
                })
                .call(selection => tippy(selection.nodes(), {allowHTML: true}));
        }
    }

    getChartTitle(){
        var result = "";
        switch (this.coordinator.param_function){
            case "sum":
                result = "Total " + this.getYAxisLabel();
                break;
            case "mean":
                result = "Average " + this.getYAxisLabel();
        }
        if( this.coordinator.per_hospital){
            result += " per reporting hospital";
        }

        return result;
    }

    getDataPointInfo(tag){
        return this.getChartTitle() + tag;
    }

    getYAxisLabel(){
        switch( this.coordinator.parameter){
            case "staff": return "Critical Staffing Shortage (today or anticipated)";
            // staff_anticipated: "Critical Staffing Shortage Anticipated within Week",
            case "deaths": return "Deaths from COVID";
            case "beds": return "Inpatient Beds Utilization (% COVID)";
            default: return "";
            // percent_beds: "Percent Inpatient Beds Utilization for COVID"
        };
    }

    // Update data because dates changed.
    // This filters the raw data based on the selection
    // Parameter: selected_dates -- start & end dates
    updateSelection(selected_dates){
        // console.log(updateSelection"); console.log(selected_dates);

        // filter the data
        this.filtered_data = coordinator.full_data.filter(d => ((d.date >= selected_dates.start_date) &&
            (d.date <= selected_dates.end_date)));

        // console.log("this.filtered data"); console.log(this.filtered_data);
        this.render(this.filtered_data);
    }
}