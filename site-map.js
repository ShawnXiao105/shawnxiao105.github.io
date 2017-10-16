var app;

require([
  // ArcGIS
  "esri/map",
  "esri/dijit/Scalebar",
  "esri/dijit/LayerList",
  "esri/dijit/Search",
  "dojo/i18n!esri/nls/jsapi",
  "dojo/query",
  "esri/arcgis/utils",
  "esri/layers/FeatureLayer",
  "esri/dijit/FeatureTable",
  "esri/dijit/Legend",
  "dojo/_base/array",
  "dojo/parser",

  // Calcite Maps
  "calcite-maps/calcitemaps-v0.4",

  // Bootstrap
  "bootstrap/Collapse",
  "bootstrap/Dropdown",
  "bootstrap/Tab",
  "bootstrap/Modal",

  "dojo/domReady!"
], function(Map, Scalebar, LayerList, Search, esriBundle, query, arcgisUtils, FeatureLayer, FeatureTable, Legend, arrayUtils, parser, CalciteMaps) {
  //parser.parse();
  esriBundle.widgets.Search.main.placeholder = "Find site or cell";
  
  // App 
  app = {
    map: null,
    scalebar: null,
    layerList: null,
    basemap: "topo",
    center: [-96.53, 38.374],
        zoom: 13,
    initialExtent: null,
    searchWidgetNav: null,
    searchWidgetPanel: null,
    legend:null,
  }

  // Map 
  app.map = new Map("mapViewDiv", {
    basemap: app.basemap,
    center: app.center,
    zoom: app.zoom
  });



  app.map.on("load", function() {
    app.initialExtent = app.map.extent;
    app.scalebar = new Scalebar({
      map: app.map,
      // "dual" displays both miles and kilometers
      // "english" is the default, which displays miles
      // use "metric" for kilometers
      scalebarUnit: "dual"
    });
  })
  
  // Create the feature layer
        var myFeatureLayer = new FeatureLayer("https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/california_census_blocks/FeatureServer/0", {
          mode: FeatureLayer.MODE_ONDEMAND,
          outFields:  ["NAME","GEOID","MTFCC","ALAND","AWATER"],
          visible: true,
          id: "fLayer"
        });

        myTable = new FeatureTable({
          featureLayer : myFeatureLayer,
          showGridMenu: false,
          hiddenFields: ["FID","C_Seq","Street"]  // field that end-user can show, but is hidden on startup
        }, "alarmsDiv");

        myTable.startup();


        var rivers = new FeatureLayer("https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Hydrography/Watershed173811/MapServer/1", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
      });
      var waterbodies = new FeatureLayer("https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Hydrography/Watershed173811/MapServer/0", {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
      });

      //add the legend
      app.map.on("layers-add-result", function (evt) {
        var layerInfo = arrayUtils.map(evt.layers, function (layer, index) {
          return {layer:layer.layer, title:layer.layer.name};
        });
        if (layerInfo.length > 0) {
           app.legend = new Legend({
            map: app.map,
            layerInfos: layerInfo
          }, "legendDiv");
          app.legend.startup();
        }
      });
app.map.addLayers([waterbodies, rivers]);
  //layerList
  app.layerList = createLayerListWidget("layersDiv");

  function createLayerListWidget(parentId) {
    var layerList = new LayerList({
      map: app.map
    }, parentId);
    layerList.startup();
    return layerList;
  }
  // Search
  app.searchDivNav = createSearchWidget("searchNavDiv");
  app.searchWidgetPanel = createSearchWidget("searchPanelDiv");

  function createSearchWidget(parentId) {
    var search = new Search({
      map: app.map,
      enableHighlight: false
    }, parentId);
    search.startup();
    return search;
  }

  function createLegendWidget(parentId) {
    var legendDijit = new Legend({
            map: app.map,
            layerInfos: layerInfo
          }, "legendDiv");
    app.legendDijit.startup(); 
    return legendDijit;
  }

  // Basemaps
  query("#selectBasemapPanel").on("change", function(e) {
    app.map.setBasemap(e.target.options[e.target.selectedIndex].value);
  });

  // Home
  query(".calcite-navbar .navbar-brand").on("click", function(e) {
    app.map.setExtent(app.initialExtent);
  })

});