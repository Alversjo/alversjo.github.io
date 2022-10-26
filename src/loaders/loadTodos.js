import { loadGoogleSpreadSheet } from '../utils/loadSpreadSheet';
import { PLACEMENT_MAP_SHEET } from '../constants';

const iconsSize = 64;
const iconAnchor = iconsSize * 0.5;

var centeredIcon = L.Icon.extend({
    options: {
        iconSize:     [iconsSize, iconsSize],
        iconAnchor:   [iconAnchor,iconsSize],
        popupAnchor:  [0,-iconsSize*0.5]
    }
});

export const loadTodos = async (map) => 
{
    const spreadsheetdata = await loadGoogleSpreadSheet(PLACEMENT_MAP_SHEET, 'todos!A2:E');
    let todoLayer = L.layerGroup();
    let iconType = new centeredIcon({iconUrl: './img/icons/todo.png'});

    for (let i = 0; i < spreadsheetdata.length; i++) 
    {
        if (spreadsheetdata[i][4]) //Check if 'lat,lon' column is not empty
        {
            const [date,done,task,description,lonlat] = spreadsheetdata[i];

            //parse the lonlat-string according to how it is written, with or without a comma sign
            let [lon, lat] = lonlat.includes(",") ? lonlat.split(",") : lonlat.split(" ");

            //create the popup window
            const content = '<h3>' + task + '</h3>' + '<p>' + description + '</p>';
            L.marker([lon, lat],{ icon: iconType }).addTo(todoLayer).bindPopup(content);
        }
    }

    return todoLayer;
};

export const AddTodoButton = async (map) => 
{
    
};