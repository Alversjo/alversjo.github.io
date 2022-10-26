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
import { postDataToSheet } from './utils/loadSpreadSheet';

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

    // ------------------------------------------------------------------------------------------------------
    // ADD TODO MARKERS START HERE
    // ------------------------------------------------------------------------------------------------------
    function addMarker(e)
    {
        // Add marker to map at click location; add popup window
        var newMarker = new L.marker(e.latlng).addTo(map);
        const spreadsheetdata = postDataToSheet(e.latlng);
        map.off('click', addMarker);
        console.log(e.latlng.lat,e.latlng.lng); 
    }

    // create custom button
    const customControl = L.Control.extend(
    {
        // button position
        options: 
        {
            position: "topright",
        },

        // method
        onAdd: function (map) 
        {
            // create button
            const btn = L.DomUtil.create("button");
            btn.title = "Add Todos";
            btn.textContent = "Add Todo";
            btn.className = "todo_btn";
            btn.setAttribute("style",
            "background-color: white; width: 45px; height: 45px; border: 1px; display: flex; cursor: pointer; justify-content: center; font-size: 1rem;");

            //So that clicking the button doesnt add a todo item under it
            L.DomEvent.disableClickPropagation(btn);

            // actions on mouseover
            btn.onmouseover = function () {
            this.style.transform = "scale(1.1)";
            };

            // actions on mouseout
            btn.onmouseout = function () {
            this.style.transform = "scale(1)";
            };

            // action when click on button
            btn.onclick = function () 
            {
               console.log('Waiting to add todo');
               map.on('click', addMarker);
            };

            return btn;
        },
    });

    // adding new button to map control
    map.addControl(new customControl());
};
