import L from 'leaflet';
import 'leaflet.locatecontrol';
import 'leaflet.polylinemeasure';
// import 'leaflet-hash-plus';
// import 'leaflet-search';
// import { addSearch } from './utils/searchControl';
// import { startTracking } from './loaders/loadTrackers';
import { loadNatureReserve } from './loaders/loadNatureReserve';
import { loadTooltipZoom } from './utils/loadTooltipZoom';
import { loadPositionControl } from './utils/loadPositionControl';
import { loadImageOverlay } from './loaders/loadImageOverlay';
import { loadDrawnMap } from './loaders/loadDrawnMap';
import { addLegends } from './loaders/addLegends';
import { loadPoi } from './loaders/loadPoi';
import { loadTodos } from './loaders/loadTodos';
import { AddTodoButton } from './loaders/loadTodos';

export const createMap = async () => 
{
    const map = L.map('map', { zoomControl: false, maxZoom: 20 }).setView([57.621111, 14.927857], 17);

    // Map feature layers
    map.groups = {};
    map.groups.natureReserve = (await loadNatureReserve(map)).addTo(map);
    // map.groups.fireRoads = (await loadFireRoads(map)).addTo(map);

    // Toggable layers
	map.groups.poi = (await loadPoi(map)); //.addTo(map); //This decides if it will be visible on the map from start or not.
	map.groups.todos = (await loadTodos(map)).addTo(map);
   
    // Base layers
    map.groups.googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);
    map.groups.drawnmap = await loadDrawnMap(map);
    var baseLayers = {"Satellite map": map.groups.googleSatellite, "Drawn map": map.groups.drawnmap};

    // Extra layers
    map.groups.slopemap = await loadImageOverlay(map, './data/slopemap.png', [[57.6183258637506626, 14.9211877664388641], [57.6225237073944072,14.9346879887464876]]);
    map.groups.terrain = await loadImageOverlay(map, './data/terrain.png', [[57.6156422900704257, 14.9150971736724536], [57.6291230394961715,14.9362178462290363]]);
    // map.groups.hippo = await loadImageOverlay(map, './img/hippo.png', [[57.62241, 14.92153], [57.61908,14.93346]]);
    // map.groups.discoDiffusion = await loadDiscoDiffusion(map);
    var extraLayers = {
                        "Terrain": map.groups.terrain,
                        "Slope map": map.groups.slopemap,
                        "POI": map.groups.poi,
                        "Todo": map.groups.todos
                      };

    // if (new Date('2022-07-28') < new Date())
    // {
    //     extraLayers["Friday Forecast"] = map.groups.discoDiffusion;
    // }   

    // Add layer control and legends
    L.control.layers(baseLayers, extraLayers).addTo(map);
    addLegends(map);

    // Add map features
    // await loadTooltipZoom(map);
    L.control.scale({metric: true, imperial: false}).addTo(map);
    await loadPositionControl(map);
    L.control.polylineMeasure().addTo(map);
    // await addSearch(map);

    // let hash = new L.Hash(map);  // Makes the URL follow the map

    // startTraking(map);

    //Add Todo adding capabilities
    AddTodoButton(map);
};
