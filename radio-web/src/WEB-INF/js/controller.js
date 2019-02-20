/**
 * de_sb_radio.Controller: abstract controller.
 * Copyright (c) 2018 Sascha Baumeister
 */
"use strict";

let CONTEXT = { audioContext: null };

/**
 * Creates an "abstract" controller.
 */
export default function Controller () {
	Object.defineProperty(this, 'audioContext', {
		enumerable: true,
		get: () => CONTEXT.audioContext,
		set: object => CONTEXT.audioContext = object
	});
}



/**
 * Displays the view associated with this controller.
 */
Object.defineProperty(Controller.prototype, "display", {
	writable: true,
	value: function () {
		throw new Error("this operation must be overriden!");
	}
});


/**
 * Displays the given error in the footer, or resets it if none is given.
 * @param error {Object} the optional error
 */
Object.defineProperty(Controller.prototype, "displayError", {
	writable: true,
	value: function (error) {
		let outputElement = document.querySelector("body > footer output");
		if (error) {
			console.error(error);
			outputElement.value = error instanceof Error ? error.message : error;
		} else {
			outputElement.value = "";
		}
	}
});


/**
 * Sends an asynchronous HTTP request, and returns a promise that resolves into an HTTP
 * response body. The promise is rejected if there is a network I/O problem, or if the
 * response's status is out of the [200,299] success range; the resulting exception
 * carries the (raw) HTTP response headers in an additional "headers" property.
 * @param resource {String} the service URI
 * @param method {String} the service method
 * @param headers {Object} the optional request headers map
 * @param body {Object} the optional request body
 * @param type {String} the optional response type ("text", "arraybuffer", "blob", ...) 
 * @param alias {String} an optional user alias
 * @param password {String} an optional user password
 * @return {Promise} the promise of a resolved XMLHttpRequest
 * @throws {Error} if HTTP authentication fails
 */
 Object.defineProperty(Controller.prototype, "xhr", {
	value: function (resource, method, headers, body, type, alias, password) {
		let exchange = new XMLHttpRequest();
		exchange.responseType = type || "text";
		exchange.withCredentials = true;
		exchange.open(method, resource, true, alias, password);
		for (const key of Object.keys(headers || {})) {
			exchange.setRequestHeader(key, headers[key]);
		}

		return new Promise((resolve, reject) => {
			exchange.addEventListener("load", event => {
				if (event.target.status >= 200 && event.target.status <= 299) {
					resolve(event.target.response);
				} else {
					let error = new Error("HTTP " + event.target.status + " " + event.target.statusText);
					error.headers = event.target.getAllResponseHeaders();
					reject(error);
				}
			});

			exchange.addEventListener("error", event => reject(new Error("HTTP exchange failed")));
			exchange.send(body || "");
		});
	}
});


/**
 * The globally accessible session owner entity.
 */
Object.defineProperty(Controller, "sessionOwner", {
	writable : true,
	value : null
});


/**
 * Private operation handling menu item selection and main element clearance.
 * @param {Event} event the click event
 */
const clickAction = function (event) {
	let mainElement = document.querySelector("main");
	while (mainElement.lastChild) {
		mainElement.removeChild(mainElement.lastChild);
	}

	let menuElement = event.target.parentElement;
	for (let element of menuElement.parentElement.children) {
		element.classList.remove("selected");
	}
	menuElement.classList.add("selected");
};


/**
 * Perform controller callback registration during DOM load event handling.
 * The callbacks handle menu item selection and main element clearance.
 */
window.addEventListener("load", event => {
	for (let anchor of document.querySelectorAll("header a")) {
		anchor.addEventListener("click", clickAction);
	}
});
