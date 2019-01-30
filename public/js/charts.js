var data = [];

d3.json("https://ist-backend.herokuapp.com/shutdowns", function (data) {

// data from districts json file for states list
// create new array with just States
// remove duplicates in the array to end up with list of states
// data from shutdowns json file for number of shutdowns per state
// find number of items with State equal to a term from list of shutdowns and add it (state and number of shutdowns) to new finaldata Array



//
//
//
// var svg = d3.select('div.bar-chart')
//
// var widht = 720;
// var height = 500;
// var margin = ({top: 20, right: 0, bottom: 30, left: 40});
//
// var x = d3.scaleBand()
//     .domain(data.map(d => d.name))
//     .range([margin.left, width - margin.right])
//     .padding(0.1);
//
// var y = d3.scaleLinear()
//     .domain([0, d3.max(data, d => d.value)]).nice()
//     .range([height - margin.bottom, margin.top]);
//
// var xAxis = g => g
//     .attr("transform", `translate(0,${height - margin.bottom})`)
//     .call(d3.axisBottom(x).tickSizeOuter(0));
//
// var yAxis = g => g
//     .attr("transform", `translate(${margin.left},0)`)
//     .call(d3.axisLeft(y))
//     .call(g => g.select(".domain").remove());
//
//
//     chart = {
//       const svg = d3.select(DOM.svg(width, height));
//
//       svg.append("g")
//           .attr("fill", "steelblue")
//         .selectAll("rect")
//         .data(data)
//         .join("rect")
//           .attr("x", d => x(d.name))
//           .attr("y", d => y(d.value))
//           .attr("height", d => y(0) - y(d.value))
//           .attr("width", x.bandwidth());
//
//       svg.append("g")
//           .call(xAxis);
//
//       svg.append("g")
//           .call(yAxis);
//
//       return svg.node();
//     }
//
// d3 = require("d3@5");
//
