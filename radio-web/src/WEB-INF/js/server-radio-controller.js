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
			
			try{
	            	var artists = JSON.parse(await this.xhr("/services/tracks/artists", "GET", {"Accept": "application/json"}, "", "text", "ines.bergmann@web.de", "ines")); 
				} catch (error) {
					this.displayError(error);
				}

			const mainElement = document.querySelector("main");
			mainElement.appendChild(document.querySelector("#server-radio-template").content.cloneNode(true).firstElementChild);
			mainElement.querySelector(".buttonGenreSearch").addEventListener("click", event => this.searchGenre());
			mainElement.querySelector(".buttonArtistSearch").addEventListener("click", event => this.searchArtist());
			
			var genreDiv = mainElement.querySelectorAll("genres");
			var labels = genreDiv.querySelectorAll(".horizontal");
			var checkboxes = genreDiv.querySelectorAll("input[type='checkbox']");
			
			for(let i=0; i<genres.length;i++){
				labels[i+2].innerHTML= genres[i];
				checkboxes[i].id = genres[i];
			}
			
			var artistDiv = mainElement.querySelectorAll("artists");
			var labels = genreDiv.querySelectorAll(".horizontal");
			var checkboxes = genreDiv.querySelectorAll("input[type='checkbox']");
			
			for(let i=0; i<genres.length;i++){
				labels[i+2].innerHTML= artists[i];
				checkboxes[i].id = artists[i];
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
		playByteArray(document.content);
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

	/**
	 * 
	 */
	Object.defineProperty(ServerRadioController.prototype, "searchGenre", {
		enumerable: false,
		configurable: false,
		value: async function () {
			this.displayError();

			try {
				var genreDiv = document.querySelectorAll("genres");
				var checkboxes = genreDiv.querySelectorAll("input[type='checkbox']");
				var searchedGenres = "";
                for(var i = 0; i < checkboxes.length; i++) {
                	if(checkboxes[i].checked == true){
                		searchedGenres+="genre="+checkboxes[i].id+"&";
                	}
                }
                searchedGenres = searchedGenres.slice(0, -1);
           
                console.log (searchedGenres);
				//FETCH!
				var tracks = await fetch("/services/tracks?"+searchedGenres, {
			        method: "GET", // *GET, POST, PUT, DELETE, etc.
			        mode: "cors", // no-cors, cors, *same-origin
			        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
			        credentials: "include", // include, *same-origin, omit
			        headers: {
			              'Accept': 'application/json',
					'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			        },
			        //body: JSON.stringify(data), // body data type must match "Content-Type" header
			    }).then(res => res.json()).catch(function (error) {
			        console.log(error);
			       });
				console.log(tracks);
				
			} catch (error) {
				this.displayError(error);
			}
			
			let listOfTracks = document.querySelector("#listOfTracks");
			while (listOfTracks.lastChild) { //Lösche alle vorherigen Einträge
				listOfTracks.removeChild(listOfTracks.lastChild);
			}
			for(let track of tracks){
				  var li = document.createElement("li");
				  li.appendChild(document.createTextNode(track.name));
				  listOfTracks.appendChild(li);
			}
			
			//var player = document.querySelector("#player");
			//player.src = "/services/documents/45";
			playAudio(tracks[0].identity);
		}
	});
	
	/**
	 * 
	 */
	Object.defineProperty(ServerRadioController.prototype, "searchArtist", {
		enumerable: false,
		configurable: false,
		value: async function () {
			this.displayError();

			try {
				var artistsDiv = document.querySelectorAll("artists");
				var checkboxes = artistsDiv.querySelectorAll("input[type='checkbox']");
				var searchedArtists = "";
                for(var i = 0; i < checkboxes.length; i++) {
                	if(checkboxes[i].checked == true){
                		searchesArtists+="artist="+checkboxes[i].id+"&";
                	}
                }
                searchedArtists = searchedArtists.slice(0, -1);
           
                console.log (searchedArtists);
				//FETCH!
				var artists = await fetch("/services/tracks?"+searchedArtists, {
			        method: "GET", // *GET, POST, PUT, DELETE, etc.
			        mode: "cors", // no-cors, cors, *same-origin
			        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
			        credentials: "include", // include, *same-origin, omit
			        headers: {
			              'Accept': 'application/json',
					'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			        },
			        //body: JSON.stringify(data), // body data type must match "Content-Type" header
			    }).then(res => res.json()).catch(function (error) {
			        console.log(error);
			       });
				console.log(artists);
				
			} catch (error) {
				this.displayError(error);
			}
			
			let listOfArtists = document.querySelector("#listOfArtists");
			while (listOfArtists.lastChild) { //Lösche alle vorherigen Einträge
				listOfArtists.removeChild(listOfArtists.lastChild);
			}
			for(let artist of artists){
				  var li = document.createElement("li");
				  li.appendChild(document.createTextNode(track.name));
				  listOfArtists.appendChild(li);
			}		
			
		}
	});

	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		const anchor = document.querySelector("header li:nth-of-type(2) > a");
		const controller = new ServerRadioController();
		anchor.addEventListener("click", event => controller.display());

		anchor.dispatchEvent(new MouseEvent("click"));
	});
	
    
} ());
