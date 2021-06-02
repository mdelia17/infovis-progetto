var colors = {1: "#4e79a7", 2: "#59a14f", 3: "#9c755f", 4: "#f28e2b", 5: " #edc948", 
                6: "#bab0ac", 7: "#e15759 ", 8: "#b07aa1", 9: "#76b7b2", 10: "#ff9da7"}

var margin = {top: 40, right: 40, bottom: 40, left: 40}
var width = d3.select('body').node().getBoundingClientRect().width - margin.left - margin.right;
var height = 700 - margin.top - margin.bottom;

var max = 80
var min = 20

var yScale = d3.scaleLinear().range([0 + margin.top + 3*max, height - margin.bottom]);
var xScale = d3.scaleLinear().range([0 + margin.left + 3*min, width - margin.right]);
var basketScale = d3.scaleLinear().range([min, max]);
var envelopeScale = d3.scaleLinear().range([min, max]);

var highlightedBalloon = null;
var highlightedColor = null;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("preserveAspectRatio", "xMidYMin slice")
    .attr("style", "background-color:#87CEEB");

// data load    
d3.json("resources/data.json")
	.then(function(data) {
            updateXScaleDomain(data);
            updateYScaleDomain(data);
            updateBasketDomain(data);
            updateEnvelopeDomain(data);
            drawClouds();
            drawBalloons(data);

            d3.selectAll('.balloon').on('click', clickEventHandler);
    });

// function to draw balloons    
function drawBalloons(data) {
    var balloons = svg.selectAll(".balloon").data(data)
        .enter()
        .append("g")
        .classed("balloon", true)
        .attr('x', function (d) { return xScale(d.x);})
        .attr('y',  function (d) { return yScale(d.y);})
        .attr("id", function (d) { return "balloon" + (d.id) })
        .attr("fill", function(d) { return colors[d.color]});

        drawBaskets(balloons, data);
        drawEnvelopes(balloons, data);

    balloons.transition().duration(3000)
    .attr("transform", function (d) { return" translate(" + xScale(d.x) + "," + yScale(d.y) + ")" });
}

// function to draw baskets   
function drawBaskets(balloons, data){
    var baskets = balloons.append("path")
        .attr("class", "basket")
        .attr("d",function (d) {
            let path = '';
            let basketDim = basketScale(d.basket);
            path += basketPath(basketDim, path);
            return path;
        })
        .attr("dimension",function (d) { return basketScale(d.basket)})
        .attr('stroke-width', 1.4)
        .attr("stroke", "#404040");
}

// function to draw envelopes   
function drawEnvelopes(balloons, data) {
    var envelopes = balloons.append("path")
    .attr("class", "envelope")
    .attr("d",function (d) {
        let path = '';
        let envelopeDim = envelopeScale(d.envelope);
        path += envelopePath(envelopeDim, path);
        return path;
    })
    .attr("dimension",function (d) { return envelopeScale(d.envelope)})
    .attr('stroke-width', 1.4)
    .attr("stroke", "#404040");
}

// function to draw clouds on the background   
function drawClouds(rt) {
    var rate = rt ? rt : 50;
    var clouds = svg.append("g").classed("clouds", true)
    var nodes = d3.range(rate).map(function (i) {
        return {
            x: Math.random() * width * 8,
            y: Math.random() * height * 8,
          };
        });
    clouds.selectAll(".cloud")
        .data(nodes)
        .enter()
        .append("image")
        .attr("href", "resources/cloud.svg")
        .attr("width", 150)
        .attr("height", 150)
        .attr("fill", "#000000")
        .attr("transform", function (d) { return "scale(0.3), translate(" + d.x + "," + d.y + ")" });
}

// function that calculates a path for the basket given his dimension
// commented lines are for different representations of the basket
function basketPath(d) {
    // let path = "m 0 0 l " + (d/2) + " 0 l 0 "+ d +" l -"+ d +" 0 l 0 -"+ d + " z";
    let path = "m 0 0 h "+(d/2)+" h "+(d/16)+" v "+(d/16)+" h "+(-d/16)+" l 0 "+d+" l "+(-d)+" 0 l 0 "+(-d)+ " h "+(-d/16)+" v "+(-d/16)+" z";
    // let path = "m 0 0 h " +(d/2)+ " h " +(d/16)+ " v "+(d/16)+" h "+(-d/16)+ " l "+(-d/4)+" "+(d/2)+" h "+(-d/2)+" l "+(-d/4)+" "+(-d/2)+" h "+(-d/16)+" v "+(-d/16)+" z"; 
    return path;
}

// function that calculates a path for the envelope given his dimension
// commented lines are for different representations of the envelope
function envelopePath(d) {
    // let path = "m 0 0 l -" + d + " -" + (2*d) + " a " + d + " " + d + " 0 1 1 " + (2*d) + " 0 z";
    let path = "m 0 0 l "+(d/2)+" "+(-d)+" m "+(-d/2)+" "+d+" l "+(d/4)+" "+(-d)+" m "+(-d/4)+" "+d+" l "+(-d/4)+" "+(-d)+" m "+(d/4)+" "+d+" l "+(-d/2)+" "+(-d)+" l "+(-d/4)+" "+(-d/4)+" a "+(5*d/4)+" "+(5*d/4)+" 0 1 1 "+(3*d/2)+" 0 l "+(-d/4)+ " "+(d/4) + " h "+(-d)+" m "+(-d/4)+" "+(-d/4)+" h "+(3*d/2);
    return path;
}

// function to handle the click event on a balloon
function clickEventHandler() {
    if (highlightedBalloon == null) {
        highlightedBalloon = d3.select(this);
        highlightedColor = highlightedBalloon.attr("fill");
        highlightedBalloon.transition().duration(1000).attr("fill", "white");
        console.log ("Highlighted balloon with id " + highlightedBalloon.attr("id"));
    } else {
        let targetBalloon = d3.select(this);
        highlightedBalloon.transition().duration(1000).attr("fill", highlightedColor);
        updateBalloons(targetBalloon);
        console.log ("Highlighted balloon with id " + highlightedBalloon.attr("id") +
        ", Target balloon with id " + targetBalloon.attr("id"));
        highlightedBalloon = null;
        highlightedColor = null;
    }
}

// function to exchange the dimensions of the basket and the envelope of two different balloons
function updateBalloons(targetBalloon) {
    highlightedBasketDim = highlightedBalloon.select(".basket").attr("dimension");
    highlightedEnvelopeDim = highlightedBalloon.select(".envelope").attr("dimension");
    targetBasketDim = targetBalloon.select(".basket").attr("dimension");
    targetEnvelopeDim = targetBalloon.select(".envelope").attr("dimension");

    highlightedBalloon.select(".basket").transition().duration(5000).attr("d", basketPath(targetBasketDim));
    highlightedBalloon.select(".envelope").transition().duration(5000).attr("d",envelopePath(targetEnvelopeDim));
    targetBalloon.select(".basket").transition().duration(5000).attr("d", basketPath(highlightedBasketDim));
    targetBalloon.select(".envelope").transition().duration(5000).attr("d", envelopePath(highlightedEnvelopeDim));

    highlightedBalloon.select(".basket").attr("dimension", targetBasketDim);
    highlightedBalloon.select(".envelope").attr("dimension", targetEnvelopeDim);
    targetBalloon.select(".basket").attr("dimension", highlightedBasketDim);
    targetBalloon.select(".envelope").attr("dimension", highlightedEnvelopeDim);
}

function updateXScaleDomain(data) {
    xScale.domain([0, d3.max(data, function(d) { return d.x; })]);
}
    
function updateYScaleDomain(data){
    yScale.domain([0, d3.max(data, function(d) { return d.y; })]);
}

function updateBasketDomain(data) {
    basketScale.domain([d3.min(data, function(d) { return d.basket; }), d3.max(data, function(d) { return d.basket; })]);
}

function updateEnvelopeDomain(data) {
    envelopeScale.domain([d3.min(data, function(d) { return d.envelope; }), d3.max(data, function(d) { return d.envelope; })]);
}