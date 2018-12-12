/**
 * WelcomeController: radio welcome controller.
 * Copyright (c) 2018 Sascha Baumeister
 */
"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;

	let AUDIO_CONTEXT = window.AudioContext || window.webkitAudioContext;
	let audioContext = new AUDIO_CONTEXT();
	
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
            	var genres = JSON.parse(await this.xhr("/services/tracks/genres?offset=0&limit=100", "GET", {"Accept": "application/json"}, "", "text", "ines.bergmann@web.de", "ines")); 
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
			
			var genreDiv = mainElement.querySelector("#genreChooser");
			
			for(let i=0; i<genres.length;i++){
				var myC = null ;
				var myL = null ;

				myC = document.createElement('INPUT') ;
				myC.type = 'checkbox' ;
				myC.checked = false ;
				myC.id = genres[i];
				myL = document.createElement('LABEL') ;
				myL.innerHTML = genres[i] ;

				myL.appendChild( myC ) ;
				genreDiv.appendChild( myL ) ;
			}
			
			var artistDiv = mainElement.querySelector("#artistChooser");
			
			for(let i=0; i<artists.length;i++){
				var myC = null ;
				var myL = null ;

				myC = document.createElement('INPUT') ;
				myC.type = 'checkbox' ;
				myC.checked = false ;
				myC.id = artists[i];
				myL = document.createElement('LABEL') ;
				myL.innerHTML = artists[i] ;

				myL.appendChild( myC ) ;
				artistDiv.appendChild( myL ) ;
			}
			
			
		}
	});
	
	Object.defineProperty(ServerRadioController.prototype, "playAudio", {
		enumerable: false,
		configurable: false,
		value: async function (identity) {
		try {
				let response = await fetch("/services/documents/49", {
					method: "GET", // *GET, POST, PUT, DELETE, etc.
					credentials: "include", // include, *same-origin, omit
					headers: {"Accept" : 'audio/*'}
				});
				
				let buffer = await response.arrayBuffer();
				let source = audioContext.createBufferSource();
				
				audioContext.decodeAudioData(buffer, decodedData => { //Alternative await decodeAudioData
					source.loop = false;
					source.buffer = decodedData;
					source.connect(audioContext.destination);
					source.start();
				});
				
		} catch (error) {
			this.displayError(error);
		}
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
				var genreDiv = document.querySelector("#genreChooser");
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
			        }
			        //body: JSON.stringify(data), // body data type must match "Content-Type" header
			    }).then(res => res.json()).catch(function (error) {
			        console.log(error);
			       });
				console.log(tracks);
				
			} catch (error) {
				this.displayError(error);
			}
			
			let trackList = document.querySelector("#genreList");
			if(document.querySelector("#genreSelect")!=null)
				document.querySelector("#genreSelect").remove();
				
			let select = document.createElement("select");
			select.id = "genreSelect";
			for(let track of tracks){
				  var option = document.createElement("option");
				  option.text = track.name;
				  select.add(option);
			}
			trackList.appendChild(select);
			
			//var player = document.querySelector("#player");
			//player.src = "/services/documents/45";
			this.playAudio(tracks[0].identity);
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
				var artistDiv = document.querySelector("#artistChooser");
				var checkboxes = artistDiv.querySelectorAll("input[type='checkbox']");
				var searchedArtists = "";
                for(var i = 0; i < checkboxes.length; i++) {
                	if(checkboxes[i].checked == true){
                		searchedArtists+="artist="+checkboxes[i].id+"&";
                	}
                }
                searchedArtists = searchedArtists.slice(0, -1);
           
                console.log (searchedArtists);
				//FETCH!
				var artistTracks = await fetch("/services/tracks?"+searchedArtists, {
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
				console.log(artistTracks);
				
			} catch (error) {
				this.displayError(error);
			}
			
			let artistTrackList = document.querySelector("#artistList");
			if(document.querySelector("#artistSelect")!=null)
				document.querySelector("#artistSelect").remove();
				
			let select = document.createElement("select");
			select.id = "artistSelect";
			for(let track of artistTracks){
				  var option = document.createElement("option");
				  option.text = track.name;
				  select.add(option);
			}
			artistTrackList.appendChild(select);
		}
	});

	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		const anchor = document.querySelector("header li:nth-of-type(2) > a");
		const controller = new ServerRadioController();
		anchor.addEventListener("click", event => controller.display());
	});
	
    
} ());
