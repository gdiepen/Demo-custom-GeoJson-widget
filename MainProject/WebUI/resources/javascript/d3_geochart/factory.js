(function($) {
// factory.js
var OptionTypeTable =
{
    type : "datasource",
    parts : [ {name : "rowHeader"}, {name : "colHeader"} ],
};

AWF.Bus.subscribe({

    onCollectTypes: function(collectedTypes, contextElQ) {
        if(!contextElQ || contextElQ.awf.tags("placeable-widget-container")) {
            collectedTypes.push("D3 GeoJSON");
        }
    },

    onInitializeTags: function(elQ, type) {
        if(type === 'D3 GeoJSON') {
            elQ.awf.tags(["placeable", "contents property", "d3-geojson-widget"], 'add');
        }
    },

    onInitializeOptionTypes: function(elQ, type) {
        if(type === 'D3 GeoJSON') {

            AWF.OptionTypeCollector.addOptionType(elQ, "contents", OptionTypeTable);
            AWF.OptionTypeCollector.addOptionType(elQ, "tooltip.text", OptionTypeTable);


            // Need to make this an option type table because otherwise I don't know how to set
            // new values :-)
            AWF.OptionTypeCollector.addOptionType(elQ, "store_selection", OptionTypeTable);


            // Preferably, would like to create some proper options for this instead of having the
            // items available in the advanced section only...
            AWF.OptionTypeCollector.addOptionType(elQ, "geojson.file", AWF.OptionUtil.createOptionType("string"));
            AWF.OptionTypeCollector.addOptionType(elQ, "geojson.feature_key", AWF.OptionUtil.createOptionType("string"));
        }


    },

    onDecorateElement: function(elQ, type) {
        if(type === 'D3 GeoJSON') {
            elQ.aimms_d3_geojson_widget();
        }
    },
});

})(jQuery);

