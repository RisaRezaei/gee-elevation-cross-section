# Elevation Cross-Section

[![Google Earth Engine](https://img.shields.io/badge/Google%20Earth%20Engine-JavaScript-34A853?logo=googleearth&logoColor=white)](https://code.earthengine.google.com)
[![DEM](https://img.shields.io/badge/DEM-SRTM%20%7C%20Copernicus%20GLO--30-6D4C41)](https://developers.google.com/earth-engine/datasets/catalog/USGS_SRTMGL1_003)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23646404.svg)](https://doi.org/10.5281/zenodo.23646404)

Draw a line anywhere on Earth and get its **terrain profile**: elevation sampled every *n* metres along the line, charted against distance and exported as CSV. It's handy for river valleys, dam sites, road alignments, or checking slopes before hydrological modelling.

![Elevation profile along the example polyline with a hillshade map](docs/preview.png)

<sub>Example output: the default example line on an SRTM hillshade and its 109 km terrain profile.</sub>

## Features

- **True distance spacing**: samples are placed every `spacingMeters` along the geodesic line, not by coordinate steps.
- **Polylines supported**: works for two-point lines and multi-vertex paths.
- **Choice of DEM**: SRTM 30 m, SRTM 90 m or Copernicus GLO-30.
- **Outputs**: an elevation-vs-distance chart, a hillshade map with the line, and a CSV with distance, coordinates and elevation.

## Quick start

1. Open the [Earth Engine Code Editor](https://code.earthengine.google.com).
2. Paste [`elevation_cross_section.js`](elevation_cross_section.js) into a new script.
3. Draw a line with the geometry tool (keep the default name `geometry`), or edit `CONFIG.line`.
4. Press **Run**. The profile appears in the Console; start the CSV export from **Tasks**.

## Configuration

| Parameter | Default | Description |
|---|---|---|
| `line` | example polyline | Used when no drawn `geometry` exists |
| `spacingMeters` | `250` | Distance between samples |
| `dem` | `'SRTM30'` | `'SRTM30'`, `'SRTM90'` or `'COP30'` |
| `exportCsv` | `true` | Create the CSV export task |

## Output

`elevation_profile.csv`

| distance_km | lon | lat | elevation_m |
|---|---|---|---|
| 0.00 | 46.0000 | 37.9500 | … |
| 0.25 | … | … | … |

## Notes

- Choose a spacing close to the DEM resolution (30 m or 90 m); finer spacing only repeats the same cell values.
- SRTM covers 60° N to 56° S. Use `COP30` for higher latitudes.

## Data

- NASA SRTM Digital Elevation 30 m: [`USGS/SRTMGL1_003`](https://developers.google.com/earth-engine/datasets/catalog/USGS_SRTMGL1_003)
- CGIAR-CSI SRTM 90 m v4: [`CGIAR/SRTM90_V4`](https://developers.google.com/earth-engine/datasets/catalog/CGIAR_SRTM90_V4)
- Copernicus DEM GLO-30: [`COPERNICUS/DEM/GLO30`](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_DEM_GLO30)

## Cite this tool

Abbasalizadehrezaei, P. (2026). *Elevation Along a Cross-Section* (Version 1.0.0) [Software]. Zenodo. https://doi.org/10.5281/zenodo.23646404

GitHub also offers a ready-made citation under **Cite this repository** (from [CITATION.cff](CITATION.cff)).

## Author

**Parisa Abbasalizadehrezaei** · [risarezaei.github.io](https://risarezaei.github.io)

Released under the [MIT License](LICENSE).
