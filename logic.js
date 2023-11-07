// This file contains the logic of displaying map uning d3

// Setting a default value for townCount.
var townCount = "10";

// Define a function to get the value from an input element and update the map.
function callGetValue() {
    getValue();
}

// Retrieve the value from the slider, and update the map.
function getValue() {
    townCount = document.getElementById('myRange').value; // Get the value of the text input
    updateMap(townCount); // Update the map with the new value
}

// Set the data source URL for fetching town data
var datasource1 = "http://34.38.72.236/Circles/Towns/";

// Define the width and height for the SVG container
var width = 1000,
    height = 1000;

// Define the projection for the map, centering it around a specific latitude and longitude, and setting other projection parameters
var projection = d3.geoNaturalEarth()
    .center([0, 55.4])
    .rotate([4.4, 0])
    .scale(5000)
    .translate([width / 2, height / 2]);

// Define the path generator using the projection
var path = d3.geoPath()
    .projection(projection);

// Select the container for the map and append an SVG element to it
const container = d3.select(".home");
var svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g');

// Define a tooltip for displaying information about towns on the map
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return d.Town + ", " + d.County + "<p><strong>Pop:</strong> <span style='color:red'>" + d.Population + "</span>";
    });

// Define the zoom behavior for the map
let zoom = d3.zoom()
    .scaleExtent([1, 5])
    // Define the zoom behavior's translate extent and the event listener for zooming
    // .zoom()
    .translateExtent([[-1500, -1300], [1500, 1000]])
    .on('zoom', () => {
        svg.attr('transform', d3.event.transform); // Update the SVG's transform attribute to enable zooming
    });

// Attach the zoom behavior to the container
container.call(zoom);

// Attach the tooltip to the SVG
svg.call(tip);

// Define a function to draw the initial map
function dRaw() {
    // Load the GeoJSON data for the UK
    d3.json("uk.json", function (error, uk) {
        // Draw the subunits (regions) of the UK
        svg.selectAll(".subunit")
            .data(topojson.feature(uk, uk.objects.subunits).features)
            .enter().append("path")
            .attr("class", function (d) { return "subunit " + d.id; }) // Assign classes for styling
            .attr("d", path); // Set the path data
    });

    // Add labels to the subunits
    d3.json("uk.json", function (error, uk) {
        svg.selectAll(".subunit-label")
            .data(topojson.feature(uk, uk.objects.subunits).features)
            .enter().append("text")
            .attr("class", function (d) { return "subunit-label " + d.id; }) // Assign classes for styling
            .attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; }) // Position the labels
            .attr("dy", ".35em") // Adjust vertical position
            .text(function (d) { return d.properties.name; }); // Set the label text
    });

    // Update the map with the initial town count
    updateMap(townCount);
}

// Define a function to update the map based on the town count
function updateMap(tCount) {
    // document.getElementById("town_title").innerHTML = tCount + " towns in the UK";

    // Construct the data source URL by concatenating the base URL with the town count
    var datasource = datasource1.concat(String(parseInt(tCount)));

    // Remove any existing circles and place labels from the SVG
    svg.selectAll("circle").remove();
    svg.selectAll(".place-label").remove();

    // Fetch the town data from the server
    d3.json(datasource, function (error,twn_data) {
        // Draw circles for each town based on the fetched data
        var dots = svg.selectAll("circle")
            .data(twn_data)
            .enter()
            .append("circle")
            .attr("r", 6) // Set the radius of the circles
            .attr("cx", function (d) {
                return projection([d.lng, d.lat])[0]; // Set the x-coordinate based on longitude
            })
            .attr("cy", function (d) {
                return projection([d.lng, d.lat])[1]; // Set the y-coordinate based on latitude
            })
            .style('fill', '#000000') // Set the fill color of the circles
            .attr("class", "incident") // Set the CSS class for styling
            .on('mouseover', tip.show) // Show the tooltip on mouseover
            .on('mouseout', tip.hide); // Hide the tooltip on mouseout

        // Call the glow function to add an animation effect to the circles
        glow();

        // Define the glow function for the animation effect
        function glow() {
            dots.attr('r', 50)
                .style('fill-opacity', '0.5')
                .transition()
                .duration(2000)
                .style('fill-opacity', '1')
                .attr('r', 6);
        }

        // Add labels for each town based on the fetched data
        svg.selectAll(".place-label")
            .data(twn_data)
            .enter().append("text")
            .attr("class", "place-label")
            .attr("transform", function (d) { return "translate(" + projection([d.lng, d.lat]) + ")"; }) // Set the position of the label
            .attr("x", function (d) { return d.lng > -1 ? 6 : -6; }) // Adjust the x position based on longitude
            .attr("dy", ".35em") // Adjust vertical position
            .style("text-anchor", function (d) { return d.lng > -1 ? "start" : "end"; }) // Set the text anchor based on longitude
            .text(function (d) { return d.Town; }); // Set the text of the label
    });

    // Reset the data source URL
    datasource1 = "http://34.38.72.236/Circles/Towns/";
}

// Call the dRaw function when the window is loaded to initialize the map
window.onload = dRaw;