chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	// This is coming from background.js
	if (request.action == 'openOptionDialog') {
		if (scriptLoaded == true) {
			document.dispatchEvent(new CustomEvent('OpenPopup', {}));
			return;
		}

		var s = document.createElement('script');
		s.src = chrome.extension.getURL('OptionDialog.js');
		s.onload = function() {
			this.parentNode.removeChild(this);
			scriptLoaded = true;
			document.dispatchEvent(new CustomEvent('OpenPopup', {}));
		};
		(document.head || document.documentElement).appendChild(s);
	} else if (request.action == 'ShowOData') {

		var result = URI.parse(request.url);
		$.notify(request.method + " " + result.path, {
			autoHideDelay : 13000,
			className : 'info'
		});
	}
});

// This global variable ensures that script OptionDialog.js is loaded only once
var scriptLoaded = false;

// Below messages are coming from OptionDialog.js
window.addEventListener('message', function(event) {
	// Only accept messages from same frame
	if (event.source !== window) {
		return;
	}
	var message = event.data;

	if (message.action == 'StartSniffing') {
		// Send message to background.js. Content scripts do not have access to
		// WebRequests
		chrome.runtime.sendMessage({
			action : "StartSniffing"
		});
	} else if (message.action == 'StopSniffing') {
		chrome.runtime.sendMessage({
			action : "StopSniffing"
		});
	} else if (message.action == 'ClearCache') {
		chrome.runtime.sendMessage({
			action : "ClearCache"
		}, function(response) {
		});
	
	} else if (message.action == 'stopComponentPreloadCalls') {
		chrome.runtime.sendMessage({
			action : "stopComponentPreloadCalls"
		}, function(response) {
		});
	
	} else if (message.action == 'undoStopComponentPreloadCalls') {
		chrome.runtime.sendMessage({
			action : "undoStopComponentPreloadCalls"
		}, function(response) {
		});
	}
});
