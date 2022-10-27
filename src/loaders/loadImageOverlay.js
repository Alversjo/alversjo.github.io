import L from 'leaflet';

//In map.js add
// map.groups.hippo = await loadImageOverlay(map, './img/hippo.png', [[57.62241, 14.92153], [57.61908,14.93346]]);

export const loadImageOverlay = async (map, imageUrl, bounds) => 
{
    var latLngBounds = L.latLngBounds(bounds);

    var imageOverlay = L.imageOverlay(
        imageUrl, 
        latLngBounds, 
        {
            opacity: 1,
            interactive: false
        }
    );

    return imageOverlay;
};