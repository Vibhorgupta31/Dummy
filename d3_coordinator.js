// coordinates any charts that are initialized by this class so that data remains synchronized between charts
class D3_Coordinator {

    // Parameter: full path to CSV file
    constructor(data) {
        // parsing and formatting functions
        this.parseDate = d3.utcParse("%m/%d/%Y"); // function for parsing date
        this.formatDate = d3.timeFormat("%b. %d, %Y");
        this.formatFloat = d3.format(".2");

        // default control values
        this.parameter = "deaths";
        this.param_function = "mean";
        this.per_hospital = false;

        // save a copy of the full dataset
        this.full_data;

        // load the data from CSV
        this.loadAndPrepare(data);
    }

    // Load data
    // Parameter: full data set
    loadAndPrepare(data) {
        data = data.map(d => {
            return{
                // Reference: https://www.geeksforgeeks.org/how-to-select-min-max-dates-in-an-array-using-javascript/
                // "+" converts string to number
                date:  this.parseDate(d.date),
                state: d.state,
                // covid death fields
                deaths_covid: +d.deaths_covid,
                deaths_covid_coverage: +d.deaths_covid_coverage,
                deaths_covid_per_hospital: +d.deaths_covid_per_hospital,
                // bed utilization fields
                inpatient_beds_utilization: +d.inpatient_beds_utilization,
                inpatient_beds_utilization_coverage: +d.inpatient_beds_utilization_coverage,
                inpatient_beds_utilization_per_hospital: +d.inpatient_beds_utilization_per_hospital,
                // covid bed utilization fields
                inpatient_bed_covid_utilization: +d.inpatient_bed_covid_utilization,
                inpatient_bed_covid_utilization_coverage: +d.inpatient_bed_covid_utilization_coverage,
                inpatient_bed_covid_utilization_per_hospital: +d.inpatient_bed_covid_utilization_per_hospital,
                // critical staffing shortage fields
                critical_staffing_shortage_today_yes: +d.critical_staffing_shortage_today_yes,
                critical_staffing_shortage_today_no: +d.critical_staffing_shortage_today_no,
                critical_staffing_shortage_today_not_reported: +d.critical_staffing_shortage_today_not_reported,
                critical_staffing_shortage_anticipated_within_week_yes: +d.critical_staffing_shortage_anticipated_within_week_yes,
                critical_staffing_shortage_anticipated_within_week_no: +d.critical_staffing_shortage_anticipated_within_week_no,
                critical_staffing_shortage_anticipated_within_week_not_reported: +d.critical_staffing_shortage_anticipated_within_week_not_reported
            }
        });
        // console.log("data"); console.log(data);
        this.initialize(data);
    }

    // initializes the charts
    // Parameter: data -- the full dataset
    // Usage: Pass the full dataset to this function. The field names need to match those that are being used here.
    initialize(data){
        // create the svg for this chart
        this.svg = d3.select("#vis_container")
            .append("svg")
                .attr("class", "svg_vis_container")
                .attr("width", 800)
                .attr("height", 520)
                .attr("style", "padding-left: 20px");

        // initialize the classes -- pass the required chart heights
        this.timeslider_chart = new D3_TimeSlider("vis_timeslider", 120, this);
        this.timeseries_chart = new D3_Timeseries("vis_timeseries", 400, this);

        this.full_data = data;
        this.timeslider_chart.render(data);
        this.timeseries_chart.render(data);
    }

    // Sets the parameter value. Call from the parameters select.
    // Parameter: value -- the new value
    setParameter(value){
        this.parameter = value;
        this.timeslider_chart.handleParamChanged();
        this.timeseries_chart.handleParamChanged();
    }

    // Sets the parameter view value. Call from the function select.
    // Parameter: value -- the new value
    setParamFunction(value){
        this.param_function = value;
        this.timeslider_chart.handleParamChanged();
        this.timeseries_chart.handleParamChanged();
    }

    // Sets the per hospitals value. Call from the per hospitals checkbox.
    // Parameter: value -- the new value
    setPerHospital(value){
        this.per_hospital = value;
        this.timeslider_chart.handleParamChanged();
        this.timeseries_chart.handleParamChanged();
    }

    // Sets the start and end dates. Called when the timeslider is brushed.
    // Parameter: selected_dates -- the new start and end dates
    setDates(selected_dates/* = undefined*/){
        if(selected_dates !== undefined) {
            this.timeseries_chart.updateSelection(selected_dates);
        }
    }
}