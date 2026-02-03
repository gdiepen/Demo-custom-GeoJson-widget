(function($) {

    var _aimms_d3_geojson_chart ; 


    var store_selection_datasource ;



    function setSelectedElement(new_value){

        console.log("Requested to set stored element to : " + new_value)




        if (store_selection_datasource !== undefined){
            console.log("TRYING...")
            try{
                store_selection_datasource.values.requestSetValues([{
                    ranges: [{start:0, end:1}, {start:0, end:1}],
                    layerName: "values",
                    value: new_value
                }], function onDone(status){
                    console.log("STATUS OF SETTING VALUE")
                    console.log(status)
                })

            }
            catch(error){console.log(error)}
        }


    }





    var D3GeoJsonWidget = AWF.Widget.create({

        _create: function _create() {
            console.log("Create called")
            const widgetRootNode = this.element.find('.awf-dock.center')[0]


            console.log(widgetRootNode)
            

            try{

                let _height = widgetRootNode.getBoundingClientRect().height
                let _width = widgetRootNode.getBoundingClientRect().width

                _aimms_d3_geojson_chart = create_aimms_d3_geojson().width(_width).height(_height)


                this._aimms_d3_geojson_chart = _aimms_d3_geojson_chart

                _aimms_d3_geojson_chart.callbackFunctionSetSelectedElement(setSelectedElement)


                d3.select(widgetRootNode).call(_aimms_d3_geojson_chart)
               

                function throttle(f, delay) {
                    let timer = 0;
                    return function(...args){
                        clearTimeout(timer)


                        timer = setTimeout(() => f.apply(this, args), delay)
                    }
                }



                const myObserver = new ResizeObserver(throttle(entries => {

                  for (let entry of entries) {
                      _aimms_d3_geojson_chart.widthAndHeight( {width: entry.contentRect.width, height: entry.contentRect.height})
                  }
                }, 250));
                


                myObserver.observe(widgetRootNode)


            }
            catch(error){
                console.log(error)
            }

        },


        _refresh_selected: function(dataSource, optionName) {
            console.log("refresh called for " + optionName)
            // We need to retrieve all of the data here and then send this data to the chart
            try{
                var rowHeaderDimension = { numRows:0, numCols: 0 };
                var colHeaderDimension = { numRows:0, numCols: 0 };

                if(dataSource) {
                    rowHeaderDimension = { 
                        numRows:dataSource.rowHeader.getNumRows(),
                        numCols:dataSource.rowHeader.getNumCols() 
                    };
                    colHeaderDimension = { 
                        numRows:dataSource.colHeader.getNumCols(),
                        numCols:dataSource.colHeader.getNumRows() 
                    };
                }

                var numRowsInGrid = dataSource.values.getNumRows();
                var numColsInGrid = dataSource.values.getNumCols();



                dataSource.requestDataBlocks(
                    [
                        {start: 0, end: numRowsInGrid},
                        {start: 0, end: numColsInGrid},
                    ],
                    ["values"],
                    function onReady(layeredDataBlocks) {
                        let _value = layeredDataBlocks["values"].getLayer("values").get(0,0)
                        
                        console.log("Received value change: "+_value)
                        _aimms_d3_geojson_chart.selectedElement(_value)
                    }

                )
            }
            catch(error){
                console.log(error)
            }
        },





        _refresh_contents: function(dataSource, optionName) {
            console.log("refresh called for " + optionName)
            // We need to retrieve all of the data here and then send this data to the chart
            try{
                var rowHeaderDimension = { numRows:0, numCols: 0 };
                var colHeaderDimension = { numRows:0, numCols: 0 };

                if(dataSource) {
                    rowHeaderDimension = { 
                        numRows:dataSource.rowHeader.getNumRows(),
                        numCols:dataSource.rowHeader.getNumCols() 
                    };
                    colHeaderDimension = { 
                        numRows:dataSource.colHeader.getNumCols(),
                        numCols:dataSource.colHeader.getNumRows() 
                    };
                }

                var numRowsInGrid = dataSource.values.getNumRows();
                var numColsInGrid = dataSource.values.getNumCols();



                dataSource.requestDataBlocks(
                    [
                        {start: 0, end: numRowsInGrid},
                        {start: 0, end: numColsInGrid},
                    ],
                    ["values", "tooltips"],
                    function onReady(layeredDataBlocks) {


                        var new_data = {}

                        for (var row=0 ; row<numRowsInGrid ; row++){

                            for (var col=0 ; col < numColsInGrid ; col++){
                                try{

                                    let _element  = layeredDataBlocks["rowHeader"].getLayer("values").get(row, 0)
                                    let _value = layeredDataBlocks["values"].getLayer("values").get(row,col)

                                    new_data[_element] = _value

                                } catch(error){console.log(error)}
                            }
                        }
                        console.log("NEW DATA")
                        console.log(new_data)

                        _aimms_d3_geojson_chart.data(new_data)
                    }

                )
            }
            catch(error){
                console.log(error)
            }
        },


        _refresh_tooltip_contents: function(dataSource, optionName) {
            console.log("refresh called for " + optionName)
            // We need to retrieve all of the data here and then send this data to the chart
            try{
                var rowHeaderDimension = { numRows:0, numCols: 0 };
                var colHeaderDimension = { numRows:0, numCols: 0 };

                if(dataSource) {
                    rowHeaderDimension = { 
                        numRows:dataSource.rowHeader.getNumRows(),
                        numCols:dataSource.rowHeader.getNumCols() 
                    };
                    colHeaderDimension = { 
                        numRows:dataSource.colHeader.getNumCols(),
                        numCols:dataSource.colHeader.getNumRows() 
                    };
                }

                var numRowsInGrid = dataSource.values.getNumRows();
                var numColsInGrid = dataSource.values.getNumCols();



                dataSource.requestDataBlocks(
                    [
                        {start: 0, end: numRowsInGrid},
                        {start: 0, end: numColsInGrid},
                    ],
                    ["values"],
                    function onReady(layeredDataBlocks) {


                        var new_data = {}

                        for (var row=0 ; row<numRowsInGrid ; row++){

                            for (var col=0 ; col < numColsInGrid ; col++){
                                try{

                                    let _element  = layeredDataBlocks["rowHeader"].getLayer("values").get(row, 0)
                                    let _value = layeredDataBlocks["values"].getLayer("values").get(row,col)

                                    new_data[_element] = _value

                                } catch(error){console.log(error)}
                            }
                        }
                        console.log("NEW DATA")
                        console.log(new_data)

                        _aimms_d3_geojson_chart.tooltipTextData(new_data)
                    }

                )
            }
            catch(error){
                console.log(error)
            }
        },




        


        onResolvedOptionChanged: function(optionName, value) {
            var widget = this;



            console.log("Resolved " + optionName)


            if(optionName === "contents") {
                widget._refresh_contents(value, optionName);
            }


            if(optionName === "geojson.feature_key") {
                _aimms_d3_geojson_chart.geojsonKeyAccessor(value)
            }

            if(optionName === "geojson.file") {
                _aimms_d3_geojson_chart.geojsonSource(value.value)
            }

            if(optionName === "store_selection") {
                store_selection_datasource = value
                widget._refresh_selected(value, optionName)

            }

            if(optionName === "tooltip.text") {
                widget._refresh_tooltip_contents(value, optionName)
            }



        },


    })



    // The jQuery-UI way of registering/creating a new widget:
    $.widget('ui.aimms_d3_geojson_widget', D3GeoJsonWidget);


})(jQuery);
