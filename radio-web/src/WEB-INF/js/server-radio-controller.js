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
		value: async function () {
			this.displayError();
        
            try{
               //JSON.parse(await this.xhr("/services/tracks/genres", "GET", {"Accept": "application/json"}, "", "text", Controller.sessionOwner.email, Controller.sessionOwner.password));
            	var genres = JSON.parse(await this.xhr("/services/tracks/genres", "GET", {"Accept": "application/json"}, "", "text", "ines.bergmann@web.de", "ines")); 
			} catch (error) {
				this.displayError(error);
			}

			const mainElement = document.querySelector("main");
			mainElement.appendChild(document.querySelector("#server-radio-template").content.cloneNode(true).firstElementChild);
			mainElement.querySelector("button").addEventListener("click", event => this.search());
			
			var labels = mainElement.querySelectorAll(".horizontal");
			var checkboxes = document.querySelectorAll("input[type='checkbox']");
			
			for(let i=0; i<genres.length;i++){
				labels[i+2].innerHTML= genres[i];
				checkboxes[i].id = genres[i];
			}
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
				var checkboxes = document.querySelectorAll("input[type='checkbox']");
				var searchedGenres = "";
                for(var i = 0; i < checkboxes.length; i++) {
                	if(checkboxes[i].checked == true){
                		searchedGenres+="genre="+checkboxes[i].id+"&";
                	}
                }
                	
                searchedGenres = searchedGenres.slice(0, -1);
           
                console.log (searchedGenres);
				// Although fetch() supports sending credentials from a browser's hidden Basic-Auth credentials store, it lacks
				// support for storing them securely. This workaround uses a classic XMLHttpRequest invocation as a workaround.
				var tracks = JSON.parse(await this.xhr("/services/tracks?"+searchedGenres, "GET", {"Accept": "application/json"}, "", "text", "ines.bergmann@web.de", "ines"));
				
				console.log(tracks);
				
			} catch (error) {
				this.displayError(error);
			}
			
			let listOfTracks = document.getElementById("listOfTracks");
			for(let track in tracks){
				listOfTracks.innerHTML += track.name+ " ";
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