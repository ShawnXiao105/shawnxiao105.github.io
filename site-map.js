var app;

require([
  // ArcGIS
  "esri/map",
  "esri/dijit/Scalebar",
  "esri/dijit/LayerList",
  "esri/dijit/Search",
  "dojo/query",
  "esri/arcgis/utils",

  // Calcite Maps
  "calcite-maps/calcitemaps-v0.4",

  // Bootstrap
  "bootstrap/Collapse",
  "bootstrap/Dropdown",
  "bootstrap/Tab",
  "bootstrap/Modal",

  "dojo/domReady!"
], function(Map, Scalebar, LayerList, Search, query, arcgisUtils, CalciteMaps) {

  // App 
  app = {
    map: null,
    scalebar: null,
    layerList: null,
    basemap: "topo",
    center: [114.19149,22.28597], // lon, lat
    zoom: 11,
    initialExtent: null,
    searchWidgetNav: null,
    searchWidgetPanel: null
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

  // Basemaps
  query("#selectBasemapPanel").on("change", function(e) {
    app.map.setBasemap(e.target.options[e.target.selectedIndex].value);
  });

  // Home
  query(".calcite-navbar .navbar-brand").on("click", function(e) {
    app.map.setExtent(app.initialExtent);
  })

});