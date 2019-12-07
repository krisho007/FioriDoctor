function OpenPopup() {
	// All the Window.Message will be caught by content_script.js and further
	// propagated from there and caught in background.js

	try {
		var popup = sap.ui.getCore().byId('settingsFioriStars');
	} catch (error) {

		if ($("#openModal").length === 0) {
			$("body")
				.append(
					'<a id="fioriStarsLink" href="#openModal" style="diplay:none">Open Modal</a>');
			$("body")
				.append(
					'<div id="openModal" class="modalDialog"><div><a href="#close" title="Close" class="close">X</a><h2>UI5 Not found</h2><p>Fiori Stars could not find UI5 in this site</p></div></div>');
		}
		$("#fioriStarsLink").click();
		return;
	}
	if (!popup) {
		popup = new sap.m.Dialog('settingsFioriStars', {
			title: 'Options',
			contentWidth: "250px",
			modal: false,
			draggable: true,
			beginButton: new sap.m.Button({
				text: 'OK',
				press: function () {
					popup.close();
				}
			}),
			content: [new sap.m.List({
				items: [new sap.m.InputListItem({
					id: "controls",
					label: "Explore Controls",
					content: new sap.m.Switch({
						state: '{FioriDoctor>/exploreControls}',
						change: handleExploreSwitch
					})
				}), new sap.m.InputListItem({
					id: "views",
					label: "Show UI5 View name",
					content: new sap.m.Switch({
						state: '{FioriDoctor>/showUI5ViewName}',
						change: handleUI5ViewsSwitch
					})
				}), new sap.m.InputListItem({
					label: "Non-minified JS files",
					content: new sap.m.Switch({
						state: '{FioriDoctor>/non-minifiedJSFiles}',
						change: showNonMinifiedAppFiles
					})
				}), new sap.m.InputListItem({
					id: "OData",
					label: "Sniff OData",
					content: new sap.m.Switch({
						state: '{FioriDoctor>/sniffOData}',
						change: handleSniffSwitch
					})
				}), new sap.m.InputListItem({
					label: "Clear Cache",
					content: new sap.m.Button({
						text: 'Clear',
						press: handleClearCache
					})
				}), new sap.m.InputListItem({
					label: "UI5 Version",
					content: new sap.m.Label({
						text: sap.ui.version
					})
				})

				]

			})

			]
		});
		//TODO
		//Opening for the first time. Create the JSON model to store settings and bind to the pop-up
		var oFioriDoctorModel = new sap.ui.model.json.JSONModel();
		oFioriDoctorModel.setData({
			"exploreControls": false,
			"showUI5ViewName": false,
			"non-minifiedJSFiles": false,
			"sniffOData": false
		});
		popup.setModel(oFioriDoctorModel, 'FioriDoctor');
	}
	popup.addStyleClass("sapUiSizeCompact");
	popup.open();
}

function showNonMinifiedAppFiles(eventObject) {
	var newState = eventObject.getParameter('state');
	if (newState) {
		window.postMessage({
			action: 'stopComponentPreloadCalls'
		}, '*');
	} else {
		window.postMessage({
			action: 'undoStopComponentPreloadCalls'
		}, '*');
	}
}

function showExtensions(eventObject) {
	var newState = eventObject.getParameter('state');
	if (newState) {
		window.postMessage({
			action: 'ShowExtensions'
		}, '*');
	} else {
		window.postMessage({
			action: 'HideExtensions'
		}, '*');
	}
}

function handleClearCache(eventObject) {
	// Show busy
	var busy = sap.ui.getCore().byId('busyDialog');
	if (!busy) {
		busy = new sap.m.BusyDialog('busyDialog');
	}
	busy.open();

	window.postMessage({
		action: 'ClearCache'
	}, '*');
}

function handleExploreSwitch(eventObject) {
	var switchedOnState = eventObject.getParameter('state');
	if (switchedOnState) {
		// Add to DOM
		$('body')
			.append(
				'<div id="tooTip">'
				+ '<div id="tooTipheader">Diagnosis</div>'
				+ '<div class="items"/>'
				+ '</div>');
		// Highlighting function
		$(document).mousemove(highlight);
		$(document)
			.click(
				function (e) {
					if (e.shiftKey) {
						// Shift-Click
						var controlName = $('#tooTip').data(
							"controlName");
						e.stopPropagation();
						var helpUrl = 'https://sapui5.hana.ondemand.com/sdk/explored.html#/entity/'
							+ controlName + '/samples';
						window.open(helpUrl, '_blank');
					}
				});

		// Help to indicate opening UI5 explorer
		$('body')
			.append(
				'<div id="inf" class="sapMMessageToast sapUiSelectable" style="width: 15em; position: absolute; visibility: visible; z-index: 3730; display: block;"> Shft+Click : Open SAPUI5 Explorer </div>');

		$('#inf').css({
			left: window.innerWidth - 220,
			top: window.innerHeight - 60,
			background: 'rgba(38, 99, 137, 0.96)'
		});
	} else {
		// This click was for removing the functionality
		$('#inf').remove();
		$('#tooTip').remove();
		$(document).off('mousemove', highlight);
		$(document).unbind("click");
		$(".mouseOn").removeClass("mouseOn");

	}
}

function handleUI5ViewsSwitch(eventObject) {

	var newState = eventObject.getParameter('state');
	if (newState) {
		// Add to DOM
		$('body')
			.append(
				'<div id="tooTipforView" class="sapMMessageToast sapUiSelectable" style="text-align:left; position: absolute; visibility: visible; z-index: 3730; display: block;">sap.ushell.ui.tile.StaticTile</div>');
		// Highlighting function
		$(document).mousemove(highlightView);
	} else {
		// This click was for removing the functionality
		$('#tooTipforView').remove();
		$(document).off('mousemove', highlightView);
		$(document).unbind("click");
	}
}

function handleSniffSwitch(evetObject) {
	var newState = evetObject.getParameter('state');
	if (newState) {
		window.postMessage({
			action: 'StartSniffing'
		}, '*');
	} else {
		window.postMessage({
			action: 'StopSniffing'
		}, '*');
	}
}

prevElement = null;
function highlight(e) {

	var elem = e.target || e.srcElement;
	if (prevElement != null) {
		prevElement.classList.remove("mouseOn");
	}

	// Show Control Name
	var id = elem.id;
	var element = elem;
	while (id == "") {
		element = element.parentElement;
		id = element.id;
		if (!element) {
			break;
		}
	}

	element.classList.add("mouseOn");
	prevElement = element;

	// Get control ID
	var control = $("#" + id).control(0); // New way to get control from ID
	if (control) {
		var controlName = control.getMetadata().getName();
		// Show Control
		$('.items').html(
			'<div style= "text-align:left">' + controlName + '</div>')
			.data("controlName", controlName);

		// Make the DIV element draggable:
		dragElement(document.getElementById("tooTip"));

		// Add more data for Tile Container and Tiles
		if (controlName == 'sap.ushell.ui.launchpad.TileContainer') {
			$('.items').html(
				'<div style= "text-align:left"> <div style="color:#009de0;"> Group ID: </div>'
				+ control.getBindingContext().getObject().object
					.getId() + '</div>');
		} else if (controlName == 'sap.m.GenericTile') {
			if (control.getModel().getData()) { // Only for dynamic tile, add
				// navigation target
				$('.items')
					.html(
						'<div style= "text-align:left"> <div style="color:#009de0;"> Tile Type: </div>'
						+'<div style= "text-align:left">' + control.getParent().getProperty("viewName").split(".")[control.getParent().getProperty("viewName").split(".").length - 1] + '</div>'
						+ '<div style= "text-align:left"> <div style="color:#009de0;"> Group ID: </div>'
						+ control.getParent().getParent().getParent().getBindingContext().getObject().object.getId() + '</div>'						
						+ '<div style= "text-align:left"> <div style="color:#009de0;"> Catalog ID: </div>'
						+ control.getParent().getParent().getBindingContext().getObject().tileCatalogId.split("%3A")[2]
						+ '</div>'
						+ '<div style= "text-align:left"> <div style="color:#009de0;"> Navigates to: </div>'
						+ control.getModel().getData().nav.navigation_target_url
						+ '</div>');
			}
		}

		// Keep the id for reference and trigger an event for updating
		// properties/aggregations
		$('#tooTip').data('id', id).trigger('controlChanged');
	}
}

function highlightView(e) {

	// Ensure that this is not Shell-Home (Fiori Launchpad)
	var hashChanger = new sap.ui.core.routing.HashChanger();
	var currentHash = hashChanger.getHash();
	if (currentHash === "Shell-home") {
		$('#tooTipforView').hide();
		return;
	}

	$('#tooTipforView').show();

	// Get a control
	var elem = e.target || e.srcElement;
	var id = elem.id;
	var element = elem;
	while (id == "") {
		element = element.parentElement;
		id = element.id;
		if (!element) {
			break;
		}
	}

	// Get UI5 control
	var control = $("#" + id).control(0); // New way to get control from ID

	if (control) {
		// Get View name
		var parent = control;
		while (!parent.sViewName) {
			parent = parent.getParent();
			if (!parent) {
				break;
			}
		}

		if (!parent) {
			return;
		}

		if (!parent.sViewName) {
			return;
		}

		// Show View name
		$('#tooTipforView').html(
			'<div style= "text-align:left">' + "View name: "
			+ parent.sViewName + '</div>').data("viewName",
				parent.sViewName);

		var bottomX = e.pageX - $('#tooTipforView').width();
		var bottomY = e.pageY - $('#tooTipforView').height();
		var x = bottomX > window.innerWidth ? window.innerWidth
			- $('#tooTipforView').width() - 22 : e.pageX;
		var y = bottomY > window.innerHeight ? window.innerHeight
			- $('#tooTipforView').height() - 20 : e.pageY + 10;
		$('#tooTipforView').css({
			left: bottomX,
			top: y
		});
	}
}


function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (document.getElementById(elmnt.id + "header")) {
		// if present, the header is where you move the DIV from:
		document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

document.addEventListener('CacheClearDone', function (e) {
	// Stop busy indicator
	var busy = sap.ui.getCore().byId('busyDialog');
	if (busy) {
		busy.close();
	}
});

document.addEventListener('OpenPopup', function (e) {
	OpenPopup();
});