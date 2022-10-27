import { loadGoogleSpreadSheet } from '../utils/loadSpreadSheet';
import { postDataToSheet } from '../utils/loadSpreadSheet';
import { PLACEMENT_MAP_SHEET } from '../constants';

const iconsSize = 64;
const iconAnchor = iconsSize * 0.5;

let centeredIcon = L.Icon.extend({
    options: {
        iconSize:     [iconsSize, iconsSize],
        iconAnchor:   [iconAnchor,iconsSize],
        popupAnchor:  [0,-iconsSize*0.5]
    }
});
let iconType = new centeredIcon({iconUrl: './img/icons/todo.png'});
let todoLayer;

let todoIconUnclassified = L.divIcon({className: 'todo-icon todo-unclassified', iconSize: [28, 28]});
let todoIconCleanup = L.divIcon({className: 'todo-icon todo-cleanup', iconSize: [28, 28]});
let todoIconMove = L.divIcon({className: 'todo-icon todo-move', iconSize: [28, 28]});
let todoIconRepair = L.divIcon({className: 'todo-icon todo-repair', iconSize: [28, 28]});
let todoIconBuild = L.divIcon({className: 'todo-icon todo-build', iconSize: [28, 28]});
let todoIconInvestigate = L.divIcon({className: 'todo-icon todo-investigate', iconSize: [28, 28]});

export const loadTodos = async (map) => 
{
    const spreadsheetdata = await loadGoogleSpreadSheet(PLACEMENT_MAP_SHEET, 'todos!A2:F');
    todoLayer = L.layerGroup();

    for (let i = 0; i < spreadsheetdata.length; i++) 
    {
        if (spreadsheetdata[i][4]) //Check if 'lat,lon' column is not empty
        {
            const [date,done,task,description,lonlat,category] = spreadsheetdata[i];

            //Skip tasks that are done
            if (done === "TRUE") continue;

            //parse the lonlat-string according to how it is written, with or without a comma sign
            let [lon, lat] = lonlat.includes(",") ? lonlat.split(",") : lonlat.split(" ");

            var iconToUse = todoIconUnclassified;

            if (category && category.length > 0)
            {
                var cat = category.toLowerCase();
                if (cat === "clean up"){ iconToUse = todoIconCleanup; }
                else if (cat === "move"){ iconToUse = todoIconMove; }
                else if (cat === "repair"){ iconToUse = todoIconRepair; }
                else if (cat === "build"){ iconToUse = todoIconBuild; }
                else if (cat === "investigate"){ iconToUse = todoIconInvestigate; }
            }

            //create the popup window
            const content = '<h2>' + task + '</h2>' + '<p>' + description + '</p>';
            L.marker([lon, lat],{ icon: iconToUse }).addTo(todoLayer).bindPopup(content);
        }
    }

    return todoLayer;
};

var _map;

function addMarker(e)
{
    
    // Add marker to map at click location; add popup window
    const content = '<h3>Please go to the spreadsheet to enter info about this task.</h3>';
    var newMarker = new L.marker(e.latlng,{ icon: todoIconUnclassified }).addTo(todoLayer).bindPopup(content);
    
    //This sends the data off to the spreadsheet
    const spreadsheetdata = postDataToSheet(e.latlng);
    
    //Stop running addMarkers when the map is clicked 
    _map.off('click', addMarker);
    
    //Remove the help sign
    instructions.remove();
    
    //Make sure the help sign pops up automatically
    newMarker.openPopup();

    //Change the style after task has been added
    btn.classList.remove('add-todo-btn-animated');

    isAddingTask = false;
}

let instructions;
let btn;
let isAddingTask = false;

export const AddTodoButton = async (map) => 
{
    instructions = L.control({ position: "topright" });

    instructions.onAdd = function () {
      let div = L.DomUtil.create("div", "description");
      L.DomEvent.disableClickPropagation(div);
      const text = "<b>Click on the map to add the Task. Click button again to cancel.</b>";
      div.insertAdjacentHTML("beforeend", text);
      return div;
    };

    _map = map;

    // create custom button
    const customButton = L.Control.extend(
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
            btn = L.DomUtil.create("button", "add-todo-btn");
            btn.title = "Add Todos";
            btn.textContent = "Add Task";

            //So that clicking the button doesnt add a todo item under it
            L.DomEvent.disableClickPropagation(btn);

            // action when click on button
            btn.onclick = function () 
            {
                if (isAddingTask)
                {
                    isAddingTask = false;
                    _map.off('click', addMarker);
                    //Remove the help sign
                    instructions.remove();
                    btn.classList.remove('add-todo-btn-animated');
                }
                else
                {
                    instructions.addTo(map);
                    console.log('Waiting to add todo');
                    isAddingTask = true;
                    btn.classList.add('add-todo-btn-animated');
                    map.on('click', addMarker);
                }
            };

            return btn;
        }
    });

    // adding new button to map control
    map.addControl(new customButton());
};
