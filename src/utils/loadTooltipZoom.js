import L from 'leaflet';

export const showHideTooltipsZoom = async(map, goalZoom) => {
	// Hide tooltips dependent on zoom level
	let goal = goalZoom;
	map.eachLayer(function(layer)
	{
		if (layer.feature && layer.feature.properties)
		{
			if (layer.feature.properties.minzoom || layer.feature.properties.maxzoom)
			{
				if (layer.getTooltip)
				{
					let min = 0;
					if (layer.feature.properties.minzoom) min = layer.feature.properties.minzoom;
					let max = 100;
					if (layer.feature.properties.maxzoom) max = layer.feature.properties.maxzoom;
					var tooltip = layer.getTooltip();
					if (tooltip)
					{
						// If current zoom level is between objects min- and max-level, show
						// console.log("Zoom:", goal, "min:", min, "max:", max);
						if (goal >= min && goal <= max)
						{
							tooltip._container.style.display = "block";
						}
						else
						{
							tooltip._container.style.display = "none";
						}
						let size = "0.7rem";
						if (goalZoom == 21)
						{
							size = "1.3rem";
						}
						else if (goalZoom == 20)
						{
							size = "0.9rem";
						}
						tooltip._container.style.fontSize = size;
					}
				}
			}
		}
	});
}

export const loadTooltipZoom = async(map) => {
	// Show or hide tooltips dependent on zoom level
	map.on('zoomanim', function(event) {
		// console.log(event);
		let currentZoom = map.getZoom();
		let goal = currentZoom;
		if (event?.zoom)
		{
			goal = event.zoom;
		}
		// console.log("to zoom", goal);
		// console.log("current zoom", currentZoom);
		showHideTooltipsZoom(map, goal);
	});

	/*
	map.on('zoomstart', function(){
		var tooltip = document.querySelectorAll('.camps-list-tooltip');
		let currentZoom = map.getZoom();
		console.log(tooltip);
		console.log(tooltip.style.color);
		switch (currentZoom) {
			case 20:
				tooltip.style.fontSize = 16;
				break;
			case 21:
				tooltip.style.fontSize = 18;
				break;
			default:
				tooltip.style.fontSize = 14;
		}
	})
	*/
}

export const loadBoarderlandMarker = async(map) => {
	// Add Borderland tooltip, it should only be visible when zoomed out
    var borderlandMarker = L.circle([57.621111, 14.927857], {
        color: "ddd",
        fillColor: "#fff",
        fillOpacity: 0.0,
        radius: 10.0
    }).addTo(map);
    borderlandMarker.bindTooltip(
        "<span style='color: #fa6; opacity: 0.9; text-shadow: 2px 2px #000000; font-weight: bold; font-size: 1.8rem;'>Borderland</span>",
        { permanent: true, direction: 'center' },
    );
    borderlandMarker.feature = {}
    borderlandMarker.feature.properties = {}
    borderlandMarker.feature.properties.maxzoom = 15
	var tooltip = borderlandMarker.getTooltip();
	tooltip._container.style.display = "none";
    return true;
}