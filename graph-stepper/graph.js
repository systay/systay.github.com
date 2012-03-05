d3.select(window).on("load", function() {
    d3.json("data.json", function(json) {
        
  var width = 400,
    height = 500,
    stroke_nodes_default = "#fff",
    stroke_nodes_high = "#0ff",
    stroke_rels_default = "#999",
    stroke_rels_high = "#0ff",
    fill = d3.scale.category20();

  var vis = d3.select("#graph").append("svg")
      .attr("width", 900)
      .attr("height", 900);
  
  var force = d3.layout.force()
     .charge(-40)
     .linkDistance(30)
     .nodes(json.nodes)
     .links(json.links)
     .size([width, height])
     .start();
  
     var link = vis.selectAll("line.link")
         .data(json.links)
       .enter().append("line")
         .attr("class", "link")
         .style("stroke-width", 3)
         .attr("id", function(d) { return "rel-"+d.value;})
         .attr("x1", function(d) { return d.source.x; })
         .attr("y1", function(d) { return d.source.y; })
         .attr("x2", function(d) { return d.target.x; })
         .attr("y2", function(d) { return d.target.y; });

     var node = vis.selectAll("circle.node")
         .data(json.nodes)
       .enter().append("circle")
         .attr("class", "node")
         .attr("id", function(d) { return "node-"+d.name;})
         .attr("cx", function(d) { return d.x; })
         .attr("cy", function(d) { return d.y; })
         .attr("r", 5)
         .style("fill", function(d) { return fill(d.group); })
         .call(force.drag);

     node.append("title")
         .text(function(d) { return d.name; });

     force.on("tick", function() {
       link.attr("x1", function(d) { return d.source.x; })
           .attr("y1", function(d) { return d.source.y; })
           .attr("x2", function(d) { return d.target.x; })
           .attr("y2", function(d) { return d.target.y; });

       node.attr("cx", function(d) { return d.x; })
           .attr("cy", function(d) { return d.y; });
       
     });
    
    for(var i=0; i<json.steps.length; i++){
      if (json.steps[i].node) {
        var n = json.steps[i].node;
        stepper.step().animate(vis.select("#node-"+n)).duration(2).style("stroke", stroke_nodes_high);
        stepper.step().animate(vis.select("#node-"+n)).duration(2).style("stroke", stroke_nodes_default);
      }
      if (json.steps[i].rel) {
        var r = json.steps[i].rel;
        stepper.step().animate(vis.select("#rel-"+r)).duration(2).style("stroke", stroke_rels_high);
        stepper.step().animate(vis.select("#rel-"+r)).duration(2).style("stroke", stroke_rels_default);
      }
    }
})});
