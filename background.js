//Handle clicking on Ext Icon
chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.sendMessage(tab.id, {
		'action': 'openOptionDialog'
	});
});

// Create Context Menu
chrome.contextMenus.create({
	"title": "Search/Open SAP Note for '%s'",
	"contexts": ["selection"],
	"id": "context" + "selection"
});

// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
	var sText = info.selectionText;
	//If only numbers, this probably a SAP Note. So Open SAP Note.
	if (/^\d+$/.test(sText)) {
		var url = "https://launchpad.support.sap.com/#/notes/"
			+ encodeURIComponent(sText);
	} else {
		//If contains text, this is probbaly a search stirng. Search within Support Site.
		var url = "https://launchpad.support.sap.com/#/solutions/notes/?q="
			+ encodeURIComponent(sText);
	}
	// Using below instead of window.open(url, '_blank'), so as to open in an incognito window.
	chrome.windows.create({ "url": url, "incognito": true });
};

// Listen to messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action == "StartSniffing") {
		chrome.webRequest.onBeforeRequest.addListener(showOData, {
			urls: ["*://*/sap/opu/odata/*", "*://*/sap/hana/*",
				"*://*/sap/hba/*",
				"*://*/sap/fix/externalViewer/services/*"],
			tabId: sender.tab.id
		});
	} else if (request.action == "StopSniffing") {
		chrome.webRequest.onBeforeRequest.removeListener(showOData);
	} else if (request.action == "ClearCache") {
		var millisecondsPer5Weeks = 1000 * 60 * 60 * 24 * 7 * 25;
		var TwentyfiveWeekAgo = (new Date()).getTime() - millisecondsPer5Weeks;
		var callback = function () {
			chrome.tabs.query({
				active: true
			}, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {
					action: "CacheClearDone"
				}, function (response) {
					console.log(response.farewell);
				});
			});
		}
		chrome.browsingData.removeCache({
			since: TwentyfiveWeekAgo
		}, callback);
	} else if (request.action === "stopComponentPreloadCalls") {
		chrome.webRequest.onBeforeRequest.addListener(stopPreload, {
			urls: ["<all_urls>"]
		}, ["blocking"]);
	} else if (request.action === "undoStopComponentPreloadCalls") {
		chrome.webRequest.onBeforeRequest.removeListener(stopPreload);
	}
});

function stopPreload(details) {
	return {
		cancel: details.url.indexOf("Component-preload.js") != -1
	};
}

function showOData(details) {
	console.log(details.url);
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			action: "ShowOData",
			url: details.url,
			method: details.method
		}, function (response) {
			console.log(response.farewell);
		});
	});
}