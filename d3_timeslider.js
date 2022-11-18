// dates selection chart
class D3_TimeSlider extends D3_Timechart {

    constructor(container_id, plot_height, coordinator) {
        super(container_id, plot_height, coordinator);

        // create the svg for this chart
        this.svg = d3.select(".svg_vis_container")
            .append("svg")
            .attr("class", "svg_" + container_id)
            .attr("width", this.plot_width)
            .attr("height", this.plot_height);
    }

    // handles "brush" and "end" events
    brush_ended = function({selection}){
        // if something is selected
        if(selection) {
            // Reference: https://github.com/d3/d3-scale/blob/v4.0.2/README.md#time_invert
            // get the start and end dates from the selection
            let start_date = this.x_scale.invert(selection[0]);
            let end_date = this.x_scale.invert(selection[1]);
            this.coordinator.setDates({start_date, end_date});
        }
        // else{
        //     coordinator.setDates();
        // }
    }

    // inherits from D3_Timechart
    drawLines(line_datas){
        super.drawLines(line_datas); // do all the parent stuff

        // Reference: https://www.w3schools.com/js/js_function_bind.asp
        let brush_ended = this.brush_ended.bind(this);

        let brush = d3.brushX()
            .extent([
                [this.margin, this.margin - 5],
                [this.plot_width - this.margin, this.plot_height - this.margin]
            ])
            .on("brush", brush_ended)
            .on("end", brush_ended);

        this.svg.call(brush);
    }
}