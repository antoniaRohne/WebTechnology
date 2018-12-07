/**
 * WelcomeController: radio welcome controller.
 * Copyright (c) 2018 Sascha Baumeister
 */
"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;

	var audioContext;


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
			mainElement.querySelector(".buttonSearch").addEventListener("click", event => this.search());
			
			var labels = mainElement.querySelectorAll(".horizontal");
			var checkboxes = document.querySelectorAll("input[type='checkbox']");
			
			for(let i=0; i<genres.length;i++){
				labels[i+2].innerHTML= genres[i];
				checkboxes[i].id = genres[i];
			}
		}
	});

	
	async function playAudio(identity){
		try {
			var document = await fetch("/services/documents/49", {
		        method: "GET", // *GET, POST, PUT, DELETE, etc.
		        mode: "cors", // no-cors, cors, *same-origin
		        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		        credentials: "include", // include, *same-origin, omit
		        headers: {
		              'Accept': '*/*',
				'Content-type': '*/*',
		        },
		        //body: JSON.stringify(data), // body data type must match "Content-Type" header
		    });
			
			console.log(document); 
			
		} catch (error) {
			this.displayError(error);
		}
		playByteArray(document.);
	} 

	
	function playByteArray(bytes){
		window.audioCtx = window.AudioContext|| window.webkitAudioContext;
		audioContext = new AudioContext();
	
		var source = audioContext.createBufferSource();
		var gain = audioContext.createGain();
		//var buffer = byteToUint8Array(bytes);
			
		audioContext.decodeAudioData(bytes, function(buffer) {
		source.buffer = buffer;
		source.connect(gain);
		gain.connect(context.destination);
		source.loop = true;
		source.start(0);
		});
	}
	
	function byteToUint8Array(byteArray) {
	    var uint8Array = new Uint8Array(byteArray.length);
	    for(var i = 0; i < uint8Array.length; i++) {
	        uint8Array[i] = byteArray[i];
	    }

	    return uint8Array;
	}

    anchor.dispatchEvent(new MouseEvent('click'));
  });

