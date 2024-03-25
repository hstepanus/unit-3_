
// Load all scripts to the JS folder
function setMap() {
    // Map frame dimensions
    var width = 960,
        height = 460;

    // Create new SVG container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    // Create Albers equal area conic projection 
    var projection = d3.geoAlbers()
        .center([0, 46.2])
        .rotate([-2, 0])
        .parallels([43, 62])
        .scale(2500)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    // Example 2.6 line 1... Create graticule generator
    var graticule = d3.geoGraticule()
        .step([5, 5]); // Place graticule lines every 5 degrees of longitude and latitude

    // Create graticule background
    var gratBackground = map.append("path")
        .datum(graticule.outline()) // Bind graticule background
        .attr("class", "gratBackground") // Assign class for styling
        .attr("d", path); // Project graticule

    // Example 2.6 line 5... Create graticule lines
    var gratLines = map.selectAll(".gratLines") // Select graticule elements that will be created
        .data(graticule.lines()) // Bind graticule lines to each element to be created
        .enter() // Create an element for each datum
        .append("path") // Append each element to the SVG as a path element
        .attr("class", "gratLines") // Assign class for styling
        .attr("d", path); // Project graticule lines

    // Use Promise.all to parallelize asynchronous data loading
    var promises = [];
    promises.push(d3.csv("data/unitsData.csv")); // Load attributes from CSV
    promises.push(d3.json("data/EuropeCountries.topojson")); // Load background spatial data
    promises.push(d3.json("data/FranceRegions.topojson")); // Load choropleth spatial data
    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0],
            europe = data[1],
            france = data[2];
        console.log(csvData);
        console.log(europe);
        console.log(france);

        // Translate Europe TopoJSON
        var europeCountries = topojson.feature(europe, europe.objects.EuropeCountries),
            franceRegions = topojson.feature(france, france.objects.FranceRegions).features;

        // Add Europe countries to map
        var countries = map.append("path")
            .datum(europeCountries)
            .attr("class", "countries")
            .attr("d", path);

        // Add France regions to map
        var regions = map.selectAll(".regions")
            .data(franceRegions)
            .enter()
            .append("path")
            .attr("class", function(d) {
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path);
    }
}
