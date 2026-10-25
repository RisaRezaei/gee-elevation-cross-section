/**
 * Elevation Cross-Section
 * -----------------------
 * Samples a digital elevation model at a fixed spacing (in metres) along a
 * line, then charts the terrain profile against distance and exports it as
 * CSV. Works with two-point lines and with multi-vertex polylines.
 *
 * How to run
 *   Paste into https://code.earthengine.google.com. Either draw a line with
 *   the geometry tools (it will be called `geometry`) or edit CONFIG.line.
 *   Press Run; start the CSV export from the Tasks tab.
 *
 * Author: Parisa Abbasalizadehrezaei · https://risarezaei.github.io
 * License: MIT
 */

// =============================== CONFIG ===================================
var CONFIG = {
  // Line to profile. If you drew a line called `geometry`, it is used;
  // otherwise this example line is used.
  line: ee.Geometry.LineString([[46.00, 37.95], [46.60, 38.25], [47.10, 38.10]]),

  spacingMeters: 250,   // distance between samples along the line

  // DEM: 'SRTM30' (USGS SRTMGL1, 30 m), 'SRTM90' (CGIAR v4, 90 m) or
  //      'COP30' (Copernicus GLO-30, 30 m)
  dem: 'SRTM30',

  exportCsv: true,
  driveFolder: 'earthengine',
  filePrefix: 'elevation_profile'
};
// ==========================================================================

var line = (typeof geometry !== 'undefined') ? geometry : CONFIG.line;

// ---- DEM -----------------------------------------------------------------
var DEMS = {
  SRTM30: {img: function () { return ee.Image('USGS/SRTMGL1_003').select('elevation'); }, scale: 30},
  SRTM90: {img: function () { return ee.Image('CGIAR/SRTM90_V4').select('elevation'); }, scale: 90},
  COP30:  {img: function () {
            var col = ee.ImageCollection('COPERNICUS/DEM/GLO30').select('DEM');
            // mosaic() loses the native projection; restore it for hillshade
            return col.mosaic().setDefaultProjection(col.first().projection())
              .rename('elevation');
          }, scale: 30}
};
var demDef = DEMS[CONFIG.dem];
var dem = demDef.img();

// ---- Points every `spacingMeters` along the line (geodesic) ------------
var lengthM = line.length(1);
var cutDistances = ee.List.sequence(CONFIG.spacingMeters, lengthM, CONFIG.spacingMeters);
// cutLines splits the line at each distance; each piece starts at the next
// sample point, so piece i begins at distance i * spacing.
var pieces = ee.Geometry(line.cutLines(cutDistances, 1)).geometries();

var samples = ee.FeatureCollection(
  ee.List.sequence(0, pieces.size().subtract(1)).map(function (i) {
    var piece = ee.Geometry(pieces.get(i));
    var start = ee.List(piece.coordinates().get(0));
    return ee.Feature(ee.Geometry.Point(start), {
      distance_km: ee.Number(i).multiply(CONFIG.spacingMeters).divide(1000)
    });
  })
);

// Add the end point of the line so the profile reaches its full length.
var coords = line.coordinates();
var endPoint = ee.Feature(ee.Geometry.Point(ee.List(coords.get(-1))), {
  distance_km: lengthM.divide(1000)
});
samples = samples.merge(ee.FeatureCollection([endPoint]));

// ---- Sample the DEM ------------------------------------------------------
var profile = dem.reduceRegions({
  collection: samples,
  reducer: ee.Reducer.first().setOutputs(['elevation_m']),
  scale: demDef.scale
}).map(function (f) {
  var c = f.geometry().coordinates();
  return f.set({lon: c.get(0), lat: c.get(1)});
}).sort('distance_km');

print('Line length (km)', lengthM.divide(1000));
print('Number of samples', profile.size());

// ---- Chart: elevation vs distance --------------------------------------
print(ui.Chart.feature.byFeature({
  features: profile,
  xProperty: 'distance_km',
  yProperties: ['elevation_m']
}).setChartType('AreaChart').setOptions({
  title: 'Elevation profile (' + CONFIG.dem + ')',
  hAxis: {title: 'Distance along line (km)'},
  vAxis: {title: 'Elevation (m)'},
  legend: {position: 'none'},
  lineWidth: 1.5,
  pointSize: 0,
  colors: ['6d4c41']
}));

// ---- Map -----------------------------------------------------------------
Map.centerObject(line, 9);
Map.addLayer(ee.Terrain.hillshade(dem), {min: 0, max: 255}, 'Hillshade', true, 0.6);
Map.addLayer(line, {color: 'ffeb3b'}, 'Cross-section');
Map.addLayer(profile, {color: 'ff5722'}, 'Samples', false);

// ---- Export --------------------------------------------------------------
if (CONFIG.exportCsv) {
  Export.table.toDrive({
    collection: profile,
    description: CONFIG.filePrefix,
    folder: CONFIG.driveFolder,
    fileNamePrefix: CONFIG.filePrefix,
    fileFormat: 'CSV',
    selectors: ['distance_km', 'lon', 'lat', 'elevation_m']
  });
}
