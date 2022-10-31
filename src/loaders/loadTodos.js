import { loadGoogleSpreadSheet } from '../utils/loadSpreadSheet';
import { postDataToSheet } from '../utils/loadSpreadSheet';
import { PLACEMENT_MAP_SHEET } from '../constants';

let todoLayer;

export const loadTodos = async (map) => 
{
    const spreadsheetdata = await loadGoogleSpreadSheet(PLACEMENT_MAP_SHEET, 'todos!A2:G');
    todoLayer = L.layerGroup();

    for (let i = 0; i < spreadsheetdata.length; i++) 
    {
        if (spreadsheetdata[i][4]) //Check if 'lat,lon' column is not empty
        {
            const [date,done,task,description,lonlat,effort,prio] = spreadsheetdata[i];

            //Skip tasks that are done
            if (done === "TRUE") continue;

            //parse the lonlat-string according to how it is written, with or without a comma sign
            let [lon, lat] = lonlat.includes(",") ? lonlat.split(",") : lonlat.split(" ");

            let iconSize = 28;
            if (prio && prio.length > 0)
            {
                var pr = prio.toLowerCase();
                if (pr === "low"){ pr = ' todo-lowprio'; }
                else if (pr === "normal"){ pr = ' todo-normalprio'; }
                else if (pr === "high"){ pr = ' todo-highprio'; }
                else if (pr === "mystical"){ pr = ' todo-mysticalprio'; }
            }

            if (effort && effort.length > 0)
            {
                var eff = effort.toLowerCase();
                if (eff === "less than an hour"){ eff = ' todo-loweffort'; iconSize = 18;}
                else if (eff === "less than a day"){ eff = ' todo-mediumeffort'; iconSize = 28  ;}
                else if (eff === "several days"){ eff = ' todo-bigeffort'; iconSize = 38;}
            }

            var iconToUse = L.divIcon({className: 'todo-icon' + pr + eff, iconSize: [iconSize, iconSize]});

            //create the popup window
            const content = '<h1>' + task + '</h1>' +
            '<p>' + description + '</p>' +
            '<p class="task-header">' + prio + ' prio. Effort: ' + effort + '</p>';
            L.marker([lon, lat],{ icon: iconToUse }).addTo(todoLayer).bindPopup(content, { maxWidth : 460 });
        }
    }

    return todoLayer;
};

var _map;

function setupSubmitTaskButton()
{
  const btn = document.getElementById("tasksubmitbtn");
  btn.disabled = true;
  btn.addEventListener("click", function () 
  {
    //Get the task from the form 
    const task = document.getElementById("task").value;
    const description = document.getElementById("description").value;
    const latlng = document.getElementById("latlng").value;
    const prio = document.getElementById("prio").value;
    const effort = document.getElementById("effort").value;
    _map.closePopup();

    //This sends the data off to the spreadsheet
    postDataToSheet(task, description, effort, prio, latlng);
  });

  const taskName = document.getElementById("task");
  taskName.addEventListener("keyup", function (e) 
  {
    //enable the button if task name is longer than two
    if (e.target.value.length > 2)
    {
      btn.disabled = false;
    }
    else btn.disabled = true;
  });
}

function addMarker(e)
{   
    // Add marker to map at click location; add popup window
    const content = '<h1>What is this task about?</h1>' +
        '<form>' +
        '<input type="hidden" id="done" name="done" value="FALSE">' +
        '<input type="text" size="25" id="task" name="task" placeholder="Task name (required)" class="required">' +
        '<textarea resize="none" id="description" name="description" rows="4" cols="26" placeholder="Enter description here"></textarea>' +
        '<input type="hidden" id="latlng" name="lat,lon" value="' + e.latlng.lat + ' ' + e.latlng.lng + '">' +
        '<label for="effort">Effort:</label>' +
        '<select id="effort" name="effort">' +  
        '<option value="Less than an hour">Less than an hour</option>' +
        '<option value="Less than a day" selected>Less than a day</option>' +
        '<option value="Several days">Several days</option>' +
        '</select>' +
        '<label for="prio">Priority:</label>' +
        '<select id="prio" name="prio">' +
        '<option value="Low">Low</option>' +
        '<option value="Normal" selected>Normal</option>' +
        '<option value="High">High</option>' +
        '<option value="Mystical">Mystical</option>' +
        '</select>' +
        '<button type="reset" id="tasksubmitbtn" class="btn btn-primary addtask">Add task</button>' +
        '</form>';
        
    var icon = L.divIcon({className: 'todo-icon todo-normalprio todo-mediumcomplexity', iconSize: [28, 28]});

    var newMarker = new L.marker(e.latlng,{ icon: icon }).addTo(todoLayer).bindPopup(content);
        
    // event remove marker
    newMarker.on("popupopen", setupSubmitTaskButton);
    
    //Stop running addMarkers when the map is clicked 
    _map.off('click', addMarker);
    
    //Remove the help sign
    instructions.remove();
    
    //Make sure the help sign pops up automatically
    newMarker.openPopup();
    //Set the view to the new marker location at the current zoom level
    _map.setView(e.latlng, _map.getZoom());
    
    //Change the style of Add Task button after task has been added
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
