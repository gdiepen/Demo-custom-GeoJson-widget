create_aimms_d3_geojson = function() {

    // All widget size related items
    var outerwidth = 300
    var outerheight = 300
    var margins = {top: 10, right:10, bottom:10, left:10} ; 
    var width = outerwidth - margins.left - margins.right ; 
    var height = outerheight - margins.top - margins.bottom ; 

    // The main svg elements
    var svg
    var svgroot
    var zoom

    var fillColors

    // The data elements
    var data = [];
    var geojsonData ; 
    var tooltipTextData = [] ;
    var geojsonKeyAccessor ;
    var geojsonSource ;
    var selectedElement ; 

    var zoomedInElement;
    var path;

    // Callback function we can use to tell AIMMS about clicks we made
    var callbackFunctionSetSelectedElement;


    var updateGeojsonSource;
    
    var doRedraw;
    var doRedrawAfterElementParameterChange;

    var lastClickedElement;


    function getKey(_feature, _idx){
        try{
            let _result = _feature;

            geojsonKeyAccessor.split("###").forEach(_key => {
                _result = _result[_key];
            })

            return _result;

        }
        catch(error){
            console.log("Error while trying to determine key");
            console.log(error);

            return _idx;
        }

    }


    function chart(selection){

        function zoomed(event){

            // console.log(event)
            svg.attr("transform", event.transform); // updated for d3 v4
        }



        selection.each(function () {

            var dom = d3.select(this);





            // Setup the root svg element and the first g-child that respects the margins
            svgroot = dom.append('svg')
                .attr('class', 'geojson-chart')
                .attr('height', height)
                .attr('width', width)

            svgroot.html('          <defs> <pattern id="pattern-stripe" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"> <rect width="2" height="4" transform="translate(0,0)" fill="white"></rect> </pattern> <mask id="mask-stripe"> <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" /> </mask>      </defs>')


            svg = svgroot
                .append("g")
                .attr("transform", "translate(" + margins.left + "," + margins.top + ")");


            zoom = d3.zoom()
                .scaleExtent([1,8])
                .on("zoom", zoomed)


            updateGeojsonSource = function(){
                if (geojsonSource !== undefined){
                    d3.json(geojsonSource).then(function(geo_contents){
                        console.log("Received data")

                        geojsonData = geo_contents;
                        doRedraw()
                    })
                }
            }


            updateGeojsonSource()

            doRedraw = function(){
                // check if we have both the geojsonData as well as the key accessor function
                if ((geojsonSource === undefined) || (geojsonKeyAccessor === undefined) || (geojsonData === undefined)){
                    console.log("We are missing either the key accessor data or the geojson data, cannot draw anything")
                    return;
                }


                var r = ['#b3bbc7','#5b6474'];


                _minValue = d3.min(  d3.entries(data), _x => {return _x.value})
                _maxValue = d3.max(  d3.entries(data), _x => {return _x.value})

                var color_range = d3.scaleLinear()
                    .domain([ _minValue, _maxValue] )
                    .range(r)
                    .interpolate(d3.interpolateLab)





                // At this point in time, we now the width
                //
                try{
                    console.log("Redrawing geojson")

                    let projection = d3.geoMercator()
                        .scale(1)
                        .translate([0,0]) ;

                    path = d3.geoPath()
                        .projection(projection)

                    // Code to center the svg image keeping aspect ratio
                    var b = path.bounds(geojsonData),
                        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];


                    // Use the scale and translation to update the projection
                    projection
                        .scale(s)
                        .translate(t);


                    console.log(data)

                    g = svg.selectAll('path')
                        .data(geojsonData.features, getKey)
                        .join(
                            function(enter){
                                return enter
                                    .append('path')
                                    .attr('fill-opacity', 1)
                                    .on("mouseover", mouseover)
                                    .on("mousemove", mousemove)
                                    .on("mouseleave", mouseleave)        
                                    .on("click", clicked)
                            },
                            function(update){
                                return update
                            },
                            function(exit){
                                return exit.remove()

                            }
                        )
                        .attr('d', path)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 1)
                        .attr('fill', function(d,i){
                            _currentElementKey = getKey(d);


                            console.log("comparison")
                            console.log(_currentElementKey)
                            console.log(selectedElement)
                            console.log(width)
                            console.log("")

                            if (_currentElementKey === selectedElement){
                                return "coral"
                            }
                            else{
                                return color_range( data[_currentElementKey] )
                            }
                        })

                }catch(error){console.log(error)}

            }

            doRedrawAfterElementParameterChange = function(elementSelected){
                // Just a redraw is needed, because the selected element changed
                doRedraw()

                const targetId = selectedElement

                const target = svg.selectAll('path')
                    .filter( d => {
                        return getKey(d) === targetId
                    } )

                console.log("AAAAAA") ; 
                console.log(target) ; 

                if (elementSelected !== lastClickedElement){
                    fn_doZoom(target.datum())
                }


            }


            



//                          create a tooltip
              var Tooltip = d3.select("body")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip_d3")
                .style("position", "absolute")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("display", "block")
                .style("stroke", "white")



            




            mouseover = function(e,d) {

                _selectedElementKey = getKey(d)
                _tooltipText = _selectedElementKey

                if ((tooltipTextData !== undefined) && (tooltipTextData[_selectedElementKey] !== undefined)){
                    _tooltipText = tooltipTextData[_selectedElementKey]
                }



                
                Tooltip
                    .html(_tooltipText)
                let tooltipWidth = Tooltip.node().getBoundingClientRect().width
                let tooltipHeight = Tooltip.node().getBoundingClientRect().height

                let tooltipDeltaX = 0

                if (e.clientX >= 0.5 * width){
                    tooltipDeltaX = tooltipWidth
                }


                Tooltip
                    .style("transform", `translate3d(${e.clientX - tooltipDeltaX}px, ${e.clientY-tooltipHeight-5}px, 0px)`)


                Tooltip
                  .style("opacity", 1)


                d3.select(this)
                  .style("stroke", "red")
                .style("stroke-width", 2)
                  .style("opacity", 1)

              }
            mousemove = function(e,d) {

                _selectedElementKey = getKey(d)
                _tooltipText = _selectedElementKey
                if ((tooltipTextData !== undefined) && (tooltipTextData[_selectedElementKey] !== undefined)){
                    _tooltipText = tooltipTextData[_selectedElementKey]
                }
                Tooltip
                    .html(_tooltipText)


                let tooltipWidth = Tooltip.node().getBoundingClientRect().width
                let tooltipHeight = Tooltip.node().getBoundingClientRect().height

                let tooltipDeltaX = 0

                if (e.clientX >= 0.5 * width){
                    tooltipDeltaX = tooltipWidth
                }


                Tooltip
                    .style("transform", `translate3d(${e.clientX - tooltipDeltaX}px, ${e.clientY-tooltipHeight-5}px, 0px)`)




            }
              mouseleave = function(e,d) {
                Tooltip
                  .style("opacity", 0)
                  .style("transform", `translate3d(0px,0px,0px)`)

                d3.select(this)
                  .style("stroke", "white")
                .style("stroke-width", 1)
                  .style("opacity", 1)
              }





            function doZoom(d){
                  var bounds = path.bounds(d),
                      dx = bounds[1][0] - bounds[0][0],
                      dy = bounds[1][1] - bounds[0][1],
                      x = (bounds[0][0] + bounds[1][0]) / 2,
                      y = (bounds[0][1] + bounds[1][1]) / 2,
                      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
                      translate = [width / 2 - scale * x, height / 2 - scale * y];

                svg.transition()
                    .duration(750)
                    .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)) ; 


            }


            fn_doZoom=function(d){
                if (zoomedInElement === undefined){
                    // If nothing is zoomed in at the moment, we zoom in to current d
                    zoomedInElement = getKey(d)
                    doZoom(d)
                }
                else{
                    if (zoomedInElement === getKey(d)){
                        // If we clicked on the same province, we zoom out again
                        zoomedInElement = undefined

                        svg.transition()
                            .duration(750)
                            .call( zoom.transform, d3.zoomIdentity)

                    }
                    else{
                        // Otherwise, we zoom in to the other element

                        zoomedInElement = getKey(d)
                        doZoom(d)


                    }


                }



            }




            clicked=function(e,d){
                selectedElement = getKey(d)

                lastClickedElement = selectedElement

                console.log("clicked selected element = " + selectedElement)
                console.log("Clicked stuff = " + d) ;

               
                if (typeof callbackFunctionSetSelectedElement === 'function'){
                    callbackFunctionSetSelectedElement(selectedElement)
                }

                fn_doZoom(d)


            }




        





            




            store_selection = function(selected_element){

                aimms_selected_datasource.values.requestSetValues([{
                    ranges: [{start:0, end:1}, {start:0, end:1}],
                    layerName: "values",
                    value: selected_element
                }], function onDone(status){
                    console.log("STATUS OF SETTING VALUE")
                    console.log(status)
                })



            }



        });
    }


    chart.widthAndHeight = function(value){
        if (!arguments.length) return {width: width, height: height};
        width = value.width - margins.left - margins.right
        height = value.height - margins.top - margins.bottom

        if (typeof doRedraw === 'function') doRedraw();

        return chart;
    }


    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value - margins.left - margins.right

        if (typeof doRedraw === 'function') doRedraw();

        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value - margins.top - margins.bottom

        if (typeof doRedraw === 'function') doRedraw();
        
        return chart;
    };


    chart.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof doRedraw === 'function') doRedraw();
        return chart;
    };

    chart.callbackFunctionSetSelectedElement = function(value) {
        if (!arguments.length) return callbackFunctionSetSelectedElement;
        callbackFunctionSetSelectedElement = value;

        console.log("Setting callback function")
        console.log(callbackFunctionSetSelectedElement)
        
        return chart;
    };


    chart.selectedElement = function(value){
        if (!arguments.length) return selectedElement;
        selectedElement = value;
        
        if (typeof doRedrawAfterElementParameterChange === 'function') {doRedrawAfterElementParameterChange(selectedElement);};
        return chart;
    }

    chart.tooltipTextData = function(value){
        if (!arguments.length) return tooltipTextData;
        tooltipTextData = value;

        return chart;
    }


    chart.geojsonSource = function(value){
        if (!arguments.length) return geojsonSource;
        geojsonSource = value;
        if (typeof updateGeojsonSource === 'function') updateGeojsonSource();
        return chart;
    }

    chart.geojsonKeyAccessor = function(value){
        if (!arguments.length) return geojsonKeyAccessor;
        geojsonKeyAccessor = value;
        if (typeof doRedraw === 'function') doRedraw();
        return chart;
    }




    return chart;
}


