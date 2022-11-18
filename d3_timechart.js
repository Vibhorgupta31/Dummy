// ancestor timeseries chart
class D3_Timechart{

    // Parameters:
    //     container_id -- id of the div container
    //     plot_height -- the plot_height of the chart
    //     coordinator -- reference to the coordinator
    constructor(container_id, plot_height, coordinator){
        // id of the div container
        this.container_id = container_id;
        this.coordinator = coordinator;

        // chart margins
        this.margin = 50;
        this.plot_width = 800;
        this.plot_height = plot_height;

        // Define x_scale & y_scale_left axes
        // Reference: https://www.developer.com/design/working-with-d3-time-series-axes/
        this.x_scale = d3.scaleTime();
        this.y_scale_left = d3.scaleLinear();
        this.y_scale_right = d3.scaleLinear();
    }

    // clears the entire svg area
    clear(){
        this.svg.selectAll("*").remove();
    }

    // draws x and y axes
    // Parameter: dataset -- the dataset to use for defining the axes
    drawAxes(line_datas){
        // default axes data
        var axes_data = {
            x_values: line_datas.line_data.data.map(d => d[0]),
            y_values: line_datas.line_data.data.map(d => d[1])
        }

        // if there is a second line, use whichever one has the biggest value to set the y-axis
        if(line_datas.line_data_2.data !== undefined) {
            let axes_data_2 =  line_datas.line_data_2.data.map(d => d[1]);
            if (d3.max(axes_data.y_values) < d3.max(axes_data_2)) {
                axes_data.y_values = axes_data_2;
            }
        }

        // if there is a third line, put it on the right because the scale is percentage
        if(line_datas.line_data_3.data !== undefined) {
            var y2_values = line_datas.line_data_3.data.map(d => d[1]);
        }

        // Reference: https://observablehq.com/@d3/learn-d3-data?collection=@d3/learn-d3
        this.x_domain = d3.extent(axes_data.x_values);
        this.y_domain = [0, d3.extent(axes_data.y_values)[1]];
        if(line_datas.line_data_3.data !== undefined) {
            this.y_domain_right = [0, d3.extent(y2_values)[1]];
        }

        // Define x_scale & y_scale_left axes
        this.x_scale
            .domain(this.x_domain)
            .range([this.margin, this.plot_width - this.margin]);
        // .nice();

        this.y_scale_left
            .domain(this.y_domain)
            .range([this.plot_height - this.margin, this.margin]);

        if(line_datas.line_data_3.data !== undefined) {
            this.y_scale_right
                .domain(this.y_domain_right)
                .range([this.plot_height - this.margin, this.margin]);
            // .nice();
        }

        this.svg.append("g")
            .attr("class", "axis_x_" + this.container_id)
            .attr("transform", "translate(0," + (this.plot_height - this.margin) + ")")
            .call(d3.axisBottom(this.x_scale));
    }

    // draws the line
    // Reference: https://bl.ocks.org/davegotz/75df9c9a2d01adc950301974fb750afd
    // Parameter: line_data -- data that is ready to be put into the line
    drawLines(line_datas){
        // Add the line for the line chart.
        let line = d3.line()
            .x(d => this.x_scale(d[0]))
            .y(d => this.y_scale_left(d[1]));
        // .curve(d3.curveCardinal);

        this.path = this.svg.append("path")
            .attr("id", "axix-line")
            .attr("d", line(line_datas.line_data.data))
            .attr("fill", "none")
            .attr("stroke", "steelblue");

        if(line_datas.line_data_2.data !== undefined) {
            this.svg.append("path")
                .attr("class", "axis-line")
                .attr("d", line(line_datas.line_data_2.data))
                .attr("fill", "none")
                .attr("stroke", "darkblue");
        }

        if(line_datas.line_data_3.data !== undefined) {
            let line_right = d3.line()
                .x(d => this.x_scale(d[0]))
                .y(d => this.y_scale_right(d[1]));
            // .curve(d3.curveCardinal);

            this.svg.append("path")
                .attr("class", "axis-line")
                .attr("d", line_right(line_datas.line_data_3.data))
                .attr("fill", "none")
                .attr("stroke", "purple");
        }
    }

    // gets which function to use to aggregate the data
    getViewFunction(){
        switch(this.coordinator.param_function) {
            case "sum":
                return d3.sum;
            default: // mean
                return d3.mean;
        }
    }

    getLineDatas(){
        var line_data = undefined;
        var line_data_2 = undefined;
        var line_data_3 = undefined;
        var line_data_tag = "";
        var line_data_2_tag = "";
        var line_data_3_tag = "";
        var func = this.getViewFunction();

        switch(this.coordinator.parameter) {
            case "staff":
                if(!this.coordinator.per_hospital){
                    line_data = /*d3.rollups(this.filtered_data,
                        v => func(v, d => d.critical_staffing_shortage_today_yes), d => d.date);
                    line_data_2 = d3.rollups(this.filtered_data,
                        v => func(v, d => d.critical_staffing_shortage_anticipated_within_week_yes), d => d.date); */
                        d3.rollups(this.filtered_data, v => {
                            return func(v, d => (d.critical_staffing_shortage_today_yes +
                                d.critical_staffing_shortage_anticipated_within_week_yes));
                        }, d => d.date);
                }
                else{
                    line_data = /*d3.rollups(this.filtered_data,
                        v => func(v, d => (d.critical_staffing_shortage_today_yes /
                        (d.critical_staffing_shortage_today_yes + d.critical_staffing_shortage_today_no +
                        d.critical_staffing_shortage_today_not_reported))), d => d.date);
                    line_data_2 = d3.rollups(this.filtered_data,
                        v => func(v, d => (d.critical_staffing_shortage_anticipated_within_week_yes /
                        (d.critical_staffing_shortage_anticipated_within_week_yes +
                        d.critical_staffing_shortage_anticipated_within_week_no +
                        d.critical_staffing_shortage_anticipated_within_week_not_reported))), d => d.date); */
                        d3.rollups(this.filtered_data, v => {
                            let numerator = func(v, d => (d.critical_staffing_shortage_today_yes +
                                d.critical_staffing_shortage_anticipated_within_week_yes));

                            let denominator = func(v, d => (d.critical_staffing_shortage_today_yes +
                                d.critical_staffing_shortage_today_no +
                                d.critical_staffing_shortage_today_not_reported +
                                d.critical_staffing_shortage_anticipated_within_week_yes +
                                d.critical_staffing_shortage_anticipated_within_week_no +
                                d.critical_staffing_shortage_anticipated_within_week_not_reported));

                            return (numerator / denominator);
                        }, d => d.date);
                }
                // line_data_tag = " (today)";
                // line_data_2_tag = " (anticipated)";
                break;
            case "beds":
                if(!this.coordinator.per_hospital){
                    line_data = /*d3.rollups(this.filtered_data, v => func(v, d => d.inpatient_beds_utilization),
                        d => d.date);
                    line_data_2 = d3.rollups(this.filtered_data, v => func(v, d => d.inpatient_bed_covid_utilization),
                        d => d.date);
                    line_data_3 =*/ d3.rollups(this.filtered_data, v => {
                        return func(v, d => d.inpatient_bed_covid_utilization) /
                            func(v, d => d.inpatient_beds_utilization) * 100;
                    }, d => d.date);
                }
                else {
                    line_data = /*d3.rollups(this.filtered_data,
                        v => func(v, d => d.inpatient_beds_utilization_per_hospital), d => d.date);
                    line_data_2 = d3.rollups(this.filtered_data,
                        v => func(v, d => d.inpatient_bed_covid_utilization_per_hospital), d => d.date);
                    line_data_3 =*/ d3.rollups(this.filtered_data, v => {
                        return func(v, d => d.inpatient_bed_covid_utilization_per_hospital) /
                                func(v, d => d.inpatient_beds_utilization_per_hospital) * 100;
                    }, d => d.date);
                }
                 // line_data_tag = " (all)";
                // line_data_2_tag = " (COVID)";
                // line_data_3_tag = " (% COVID)";
                break;
            default: // deaths
                if(!this.coordinator.per_hospital){
                    line_data = d3.rollups(this.filtered_data, v => func(v, d => d.deaths_covid), d => d.date);
                }
                else{
                    line_data = d3.rollups(this.filtered_data, v => func(v, d => d.deaths_covid_per_hospital),
                        d => d.date);
                }
        }

        return {
            line_data: {
                data: line_data,
                tag: line_data_tag
            },
            line_data_2: {
                data: line_data_2,
                tag: line_data_2_tag
            },
            line_data_3: {
                data: line_data_3,
                tag: line_data_3_tag
            }
        };
    }

    // changes the charts when the parameter is changed
    handleParamChanged(){
        // let line_data = this.getLineDatas();
        var line_datas = this.getLineDatas();
        // console.log("handleParamChanged"); console.log(line_datas);

        this.clear();
        this.drawAxes(line_datas);
        this.drawLines(line_datas);
    }

    // renders the chart
    // Parameter: data -- the filtered data to display
    render(data){
        this.filtered_data = data; // save the data
        console.log(data);
        this.handleParamChanged();
    }
}