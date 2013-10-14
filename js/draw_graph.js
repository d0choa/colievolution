
/**
 * Sample HTML5 page for network visualization with cytoscape.js
 *
 * @type {string}
 */
(function () {
    "use strict";

    // var NETWORK_DATA_URI = 'http://localhost:9988/v1/networks/views';
//    var NETWORK_LOCAL_DATA_URI = 'data/galFiltered2.json';
    // var VISUAL_STYLE_URI = 'data/vs.json';
    var NETWORK_LOCAL_DATA_URI = 'data/netJSON.d3';
//    var VISUAL_STYLE_URI = 'data/vs.json';
    var NETWORK_WINDOW_TAG = "#network-view";
	
	var n = 30;
	var width = $(NETWORK_WINDOW_TAG).width(),
	    height = $(NETWORK_WINDOW_TAG).height();
	var color = d3.scale.category20();	
	
	
	var force = d3.layout.force()
	    // .charge(-120)
	    // .linkDistance(30)
	    .size([width, height]);

	var vis = d3.select(NETWORK_WINDOW_TAG)
		.append("svg")
        	.attr("viewBox", "0 0 " + width + " " + height )
        	.attr("preserveAspectRatio", "xMidYMid meet")
		    .attr("pointer-events", "all")
		.append('svg:g')
		    .call(d3.behavior.zoom().on("zoom", redraw))
		.append('svg:g');
		
		function redraw() {
		  console.log("here", d3.event.translate, d3.event.scale);
		  vis.attr("transform",
		      "translate(" + d3.event.translate + ")"
		      + " scale(" + d3.event.scale + ")");
		}
	
	vis.append('svg:rect')
	    .attr('width', width)
	    .attr('height', height)
	    .attr('fill', 'white');
		
	var loading = vis.append("text")
	    .attr("x", width / 2)
	    .attr("y", height / 2)
	    .attr("dy", ".35em")
	    .style("text-anchor", "middle")
	    .text("Simulating Layout. One moment please…");
	
		
	// draw
	d3.json(NETWORK_LOCAL_DATA_URI, function(error, graph) {
	  force
	      .nodes(graph.nodes)
	      .links(graph.links)
	      .start();	
    
		var link = vis.selectAll("line.link")
	        .data(graph.links)
	        .enter().append("svg:line")
	      	.style("stroke-width", function(d) { return d.accumulated+1; })
	        .attr("class", "link");
		var node_drag = d3.behavior.drag()
		    .on("dragstart", dragstart)
		    .on("drag", dragmove)
		    .on("dragend", dragend);
		function dragstart(d, i) {
		    force.stop() // stops the force auto positioning before you start dragging
			console.log("inside")
		}

		function dragmove(d, i) {
		    d.px += d3.event.dx;
		    d.py += d3.event.dy;
		    d.x += d3.event.dx;
		    d.y += d3.event.dy; 
		    tick(); // this is the key to make it work together with updating both px,py,x,y on d !
		}

		function dragend(d, i) {
		    d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
		    tick();
		}
		var gnodes = vis.selectAll('.node')
			.data(graph.nodes)
			.enter()
			.append('g')
			.call(node_drag)
			.classed('gnode', true);
		var node = gnodes.append("circle")
			.attr("class", "node")
			.attr("r", 4.5)
			.style("fill", function(d) { return color(d.GO_ref); });
		var labels = gnodes.append("text")
	    	.attr("dy", ".3em")
	    	.attr("text-anchor", "middle")
			.style("font-size","2.5px")
			.text(function(d) { return d.main; });
		
	  	  node.append("title")
	  	      .text(function(d) { return d.main; });
		
		force.on("tick", tick);
		
		function tick(){
	  		  // Update the links
	  		  link.attr("x1", function(d) { return d.source.x; })
	  		    .attr("y1", function(d) { return d.source.y; })
	  		    .attr("x2", function(d) { return d.target.x; })
	  		    .attr("y2", function(d) { return d.target.y; });

	  		  // Translate the groups
	  		  gnodes.attr("transform", function(d) { 
	  		    return 'translate(' + [d.x, d.y] + ')'; 
			});
		}
		
	  	setTimeout(function() {
	  		  // Run the layout a fixed number of times.
	  		  // The ideal number of times scales with graph complexity.
	  		  // Of course, don't run too long—you'll hang the page!
	  		  force.start();
	  		  for (var i = n * n; i > 0; --i) force.tick();
	  		  force.stop();
			  			  
	  		  // vis.selectAll("line")
	  		  //     .data(link)
	  		  //   .enter().append("line")
	  		  //     .attr("x1", function(d) { return d.source.x; })
	  		  //     .attr("y1", function(d) { return d.source.y; })
	  		  //     .attr("x2", function(d) { return d.target.x; })
	  		  //     .attr("y2", function(d) { return d.target.y; });
	  		  // vis.selectAll("circle")
	  		  //     .data(node)
	  		  //   .enter().append("circle")
	  		  //     .attr("cx", function(d) { return d.x; })
	  		  //     .attr("cy", function(d) { return d.y; })
	  		  loading.remove();
	  		}, 10);		  
	});
}).call(this);

