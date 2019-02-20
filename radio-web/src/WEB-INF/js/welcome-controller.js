/**
* WelcomeController: radio welcome controller.
* Copyright (c) 2018 Sascha Baumeister
*/
"use strict";
import Controller from "./controller.js";

/**
 * Creates a new welcome controller that is derived from an abstract controller.
 */
let WelcomeController = function () {
	Controller.call(this);
}
WelcomeController.prototype = Object.create(Controller.prototype);
WelcomeController.prototype.constructor = WelcomeController;


/**
 * Displays the associated view.
 */
Object.defineProperty(WelcomeController.prototype, "display", {
	writable: true,
	value: function () {
		Controller.sessionOwner = null;

		let mainElement = document.querySelector("main");
		mainElement.appendChild(document.querySelector("#login-template").content.cloneNode(true).firstElementChild);
		mainElement.querySelector("button").addEventListener("click", event => this.login());
	}
});


/**
 * Performs a login check on the given user data, assigns the controller's
 * user object if the login was successful, and initiates rendering of the
 * message view.
 */
Object.defineProperty(WelcomeController.prototype, "login", {
	enumerable: false,
	configurable: false,
	value: async function () {
		this.displayError();

		try {
			let inputElements = document.querySelectorAll("section.login input");
			const email = inputElements[0].value.trim();
			const password = inputElements[1].value.trim();

			// Although fetch() supports sending credentials from a browser's hidden Basic-Auth credentials store, it lacks
			// support for storing them securely. This workaround uses a classic XMLHttpRequest invocation as a workaround.
			Controller.sessionOwner = JSON.parse(await this.xhr("/services/people/0", "GET", {"Accept": "application/json"}, "", "text", email, password));

			document.querySelector("header li:nth-child(n+2) > a").dispatchEvent(new MouseEvent("click"));
		} catch (error) {
			this.displayError(error);
		}
	}
});


/**
 * Perform controller callback registration during DOM load event handling.
 */
window.addEventListener("load", event => {
	let anchor = document.querySelector("header li:nth-of-type(1) > a");
	let controller = new WelcomeController();
	anchor.addEventListener("click", event => controller.display());

	anchor.click();
});
