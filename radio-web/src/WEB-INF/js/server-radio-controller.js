/**
 * WelcomeController: radio welcome controller.
 * Copyright (c) 2018 Sascha Baumeister
 */
"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;


	/**
	 * Creates a new welcome controller that is derived from an abstract controller.
	 */
	const ServerRadioController = function () {
		Controller.call(this);
	}
	ServerRadioController.prototype = Object.create(Controller.prototype);
	ServerRadioController.prototype.constructor = ServerRadioController;


	/**
	 * Displays the associated view.
	 */
	Object.defineProperty(ServerRadioController.prototype, "display", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: asyn function () {
            this.displayError();
        
            try{
                Controller.sessionOwner = JSON.parse(await this.xhr("/services/tracks/genres", "GET", {"Accept": "application/json"}, "", "text", email, password));

				document.querySelector("header li:last-of-type > a").dispatchEvent(new MouseEvent("click")); 
			} catch (error) {
				this.displayError(error);
			}

			const mainElement = document.querySelector("main");
			mainElement.appendChild(document.querySelector("#server-radio-template").content.cloneNode(true).firstElementChild);
			mainElement.querySelector("button").addEventListener("click", event => this.search());
		}
	});


	/**
	 * 
	 */
	Object.defineProperty(ServerRadioController.prototype, "search", {
		enumerable: false,
		configurable: false,
		value: async function () {
			this.displayError();

			try {
				var inputs;
                document.querySelectorAll("input[type='checkbox']");
                for(var i = 0; i < inputs.length; i++) {
                inputs[i].checked = true;   
                }


				// Although fetch() supports sending credentials from a browser's hidden Basic-Auth credentials store, it lacks
				// support for storing them securely. This workaround uses a classic XMLHttpRequest invocation as a workaround.
				Controller.sessionOwner = JSON.parse(await this.xhr("/services/tracks?genre=inputs", "GET", {"Accept": "application/json"}, "", "text", email, password));

				document.querySelector("header li:last-of-type > a").dispatchEvent(new MouseEvent("click")); 
			} catch (error) {
				this.displayError(error);
			}
		}
	});


	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		const anchor = document.querySelector("header li:nth-of-type(1) > a");
		const controller = new ServerRadioController();
		anchor.addEventListener("click", event => controller.display());

		anchor.dispatchEvent(new MouseEvent("click"));
	});
    
} ());