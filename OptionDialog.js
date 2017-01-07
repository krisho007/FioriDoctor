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
			title : 'Options',
			contentWidth : "250px",
			modal : false,
			draggable : true,
			// icon: 'Icons/start_blue_49.png',
			beginButton : new sap.m.Button({
				text : 'OK',
				press : function() {
					popup.close();
				}
			}),
			content : [ new sap.m.List({
				items : [ new sap.m.InputListItem({
					id : "controls",
					label : "Explore Controls",
					content : new sap.m.Switch({
						state : false,
						change : handleExploreSwitch
					})
				}), new sap.m.InputListItem({
					id : "views",
					label : "Show UI5 View name",
					content : new sap.m.Switch({
						state : false,
						change : handleUI5ViewsSwitch
					})
				}), new sap.m.InputListItem({
					label : "Non-minified JS files",
					content : new sap.m.Switch({
						state : false,
						change : showNonMinifiedAppFiles
					})
				}), new sap.m.InputListItem({
					id : "OData",
					label : "Sniff OData",
					content : new sap.m.Switch({
						state : false,
						change : handleSniffSwitch
					})
				}), new sap.m.InputListItem({
					label : "Clear Cache",
					content : new sap.m.Button({
						text : 'Clear',
						press : handleClearCache
					})
				// }), new sap.m.InputListItem({
				// label : "Show Extensions",
				// content : new sap.m.Switch({
				// state : false,
				// change : showExtensions
				// })

				}), new sap.m.InputListItem({
					label : "UI5 Version",
					content : new sap.m.Label({
						text : sap.ui.version
					})
//				}), new sap.m.InputListItem({
//					label : "Search SAP Note",
//					content : [ new sap.m.Input(), new sap.m.Button({text:"Search"})]
				})

				]

			})

			]
		});
	}
	popup.addStyleClass("sapUiSizeCompact");
	popup.open();
}

function showNonMinifiedAppFiles(eventObject) {
	var newState = eventObject.getParameter('state');
	if (newState) {
		window.postMessage({
			action : 'stopComponentPreloadCalls'
		}, '*');
	} else {
		window.postMessage({
			action : 'undoStopComponentPreloadCalls'
		}, '*');
	}
}

function showExtensions(eventObject) {
	var newState = eventObject.getParameter('state');
	if (newState) {
		window.postMessage({
			action : 'ShowExtensions'
		}, '*');
	} else {
		window.postMessage({
			action : 'HideExtensions'
		}, '*');
	}
}

// function showAppInfo() {
// var i = i + 1;
// sap.ui.getCore().byId("settingsFioriStars").close();
// $("div").click(getId);
// }
//
// function getId(elem) {
// var id = elem.target.id;
// var element = elem.target;
// while (id == "") {
// element = element.parentElement;
// id = element.id;
// }
//
// $("div").unbind("click", getId);
//
// // Any Control within the app
// var control = $("#" + id).control(0);
// var componentId = sap.ui.core.Component.getOwnerIdFor(control);
// var component = sap.ui.getCore().getComponent(componentId);
// var oModel = component.getModel();
// alert(oModel.sServiceUrl);
// }

function handleClearCache(eventObject) {
	// Show busy
	var busy = sap.ui.getCore().byId('busyDialog');
	if (!busy) {
		busy = new sap.m.BusyDialog('busyDialog');
	}
	busy.open();

	window.postMessage({
		action : 'ClearCache'
	}, '*');
}

function handleExploreSwitch(eventObject) {
	var newState = eventObject.getParameter('state');
	if (newState) {
		// Add to DOM
		$('body')
				.append(
						'<div id="tooTip" class="sapMMessageToast sapUiSelectable" style="text-align:left; position: absolute; visibility: visible; z-index: 3730; display: block;">sap.ushell.ui.tile.StaticTile</div>');
		// Highlighting function
		$(document).mousemove(highlight);
		$(document)
				.click(
						function(e) {
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
			left : window.innerWidth - 220,
			top : window.innerHeight - 60,
			background : 'rgba(38, 99, 137, 0.96)'
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
			action : 'StartSniffing'
		}, '*');
	} else {
		window.postMessage({
			action : 'StopSniffing'
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
		$('#tooTip').html(
				'<div style= "text-align:left">' + controlName + '</div>')
				.data("controlName", controlName);

		// Add more data for Tile Container and Tiles
		if (controlName == 'sap.ushell.ui.launchpad.TileContainer') {
			$('#tooTip')
					.html(
							$('#tooTip').html()
									+ ' <div style= "text-align:left"> <div style="color:#00FFD9;"> Group ID: </div>'
									+ control.getBindingContext().getObject().object
											.getId() + '</div>');
		} else if (controlName == 'sap.m.GenericTile') {

			if (control.getModel().getData()) { // Only for dynamic tile, add
				// navigation target
				$('#tooTip')
						.html(
								$('#tooTip').html()
										+ '<div style= "text-align:left"> <div style="color:#00FFD9;"> Navigates to: </div>'
										+ control.getModel().getData().nav.navigation_target_url
										+ '</div>');
			}
		}
		var bottomX = e.pageX + $('#tooTip').width();
		var bottomY = e.pageY + $('#tooTip').height();
		var x = bottomX > window.innerWidth ? window.innerWidth
				- $('#tooTip').width() - 22 : e.pageX;
		var y = bottomY > window.innerHeight ? window.innerHeight
				- $('#tooTip').height() - 20 : e.pageY + 10;
		$('#tooTip').css({
			left : x,
			top : y
		});

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
				'<div style= "text-align:left">' + "View name "
						+ parent.sViewName + '</div>').data("viewName",
				parent.sViewName);

		var bottomX = e.pageX - $('#tooTipforView').width();
		var bottomY = e.pageY - $('#tooTipforView').height();
		var x = bottomX > window.innerWidth ? window.innerWidth
				- $('#tooTipforView').width() - 22 : e.pageX;
		var y = bottomY > window.innerHeight ? window.innerHeight
				- $('#tooTipforView').height() - 20 : e.pageY + 10;
		$('#tooTipforView').css({
			left : bottomX,
			top : y
		});
	}
}

document.addEventListener('CacheClearDone', function(e) {
	// Stop busy indicator
	var busy = sap.ui.getCore().byId('busyDialog');
	if (busy) {
		busy.close();
	}
});

document.addEventListener('OpenPopup', function(e) {
	OpenPopup();
});