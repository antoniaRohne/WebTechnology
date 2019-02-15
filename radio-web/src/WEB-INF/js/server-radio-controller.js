/**
 * WelcomeController: radio welcome controller.
 * Copyright (c) 2018 Sascha Baumeister
 */
'use strict';

(function() {
	// imports
	const Controller = de_sb_radio.Controller;

	var myAudio = document.querySelector('audio');
	let tracks = null;
	let end = false;

	/**
	 * Creates a new welcome controller that is derived from an abstract controller.
	 */
	const ServerRadioController = function() {
		Controller.call(this);

		Object.defineProperty(this, 'leftAudioSource', {
			enumerable: false,
			configurable: false,
			writable: true,
			value: null
		});

		Object.defineProperty(this, 'rightGainNode', {
			enumerable: false,
			configurable: false,
			writable: true,
			value: null
		});
		
		Object.defineProperty(this, 'leftGainNode', {
			enumerable: false,
			configurable: false,
			writable: true,
			value: null
		});

		Object.defineProperty(this, 'rightAudioSource', {
			enumerable: false,
			configurable: false,
			writable: true,
			value: null
		});
	};
	ServerRadioController.prototype = Object.create(Controller.prototype);
	ServerRadioController.prototype.constructor = ServerRadioController;

	/**
	 * Displays the associated view.
	 */
	Object.defineProperty(ServerRadioController.prototype, 'display', {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function() {
			if(!Controller.audioContext) Controller.audioContext = new AudioContext();

			this.displayError();
			var genres,artists = [];

			try {
				var response = await fetch('/services/tracks/genres?offset=0&limit=100', {
					method: 'GET', // *GET, POST, PUT, DELETE, etc.
					credentials: 'include', // include, *same-origin, omit
					headers: {
						Accept: 'application/json',
						'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
					}
				})
				if (!response.ok)
					throw new Error(response.status + ' ' + response.statusText);

				genres = await response.json();
				response = await fetch('/services/tracks/artists', {
					method: 'GET', // *GET, POST, PUT, DELETE, etc.
					credentials: 'include', // include, *same-origin, omit
					headers: {
						Accept: 'application/json',
						'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
					}
				})
				if (!response.ok)
					throw new Error(response.status + ' ' + response.statusText);

				artists = await response.json();

			} catch (error) {
				this.displayError(error);
			}

			const mainElement = document.querySelector('main');
			mainElement.appendChild(
					document.querySelector('#server-radio-template').content.cloneNode(true)
					.firstElementChild
			);
			mainElement.appendChild(
					document.querySelector('#playlist-radio-template').content.cloneNode(true)
					.firstElementChild
			);
			mainElement
			.querySelector('.buttonGenreArtistSearch')
			.addEventListener('click', event => this.searchArtistGenre());

			var genreDiv = mainElement.querySelector('#genreChooser');


			// rewrite basic option "multiple" behavior , so we can click multiple option at once
			window.onmousedown = function (e) {
				var el = e.target;
				if (el.tagName.toLowerCase() == 'option' && el.parentNode.hasAttribute('multiple') && el.parentNode.classList.contains("multipleSelect")) {
					e.preventDefault();

					// toggle selection
					if(el.hasAttribute('selected')) { 
						el.removeAttribute('selected');
					} 
					else{
						el.setAttribute('selected', '');
					}


					// hack to correct buggy behavior
					var select = el.parentNode.cloneNode(true);
					el.parentNode.parentNode.replaceChild(select, el.parentNode);
				}
			}

			var mySelect = document.createElement('select');
			mySelect.multiple = true;
			mySelect.name = "genre"
				mySelect.classList.add("customScrollBar", "multipleSelect")
				var h2 = document.createElement('h2');
			h2.innerHTML = "Genres";
			genreDiv.appendChild(h2);
			for (let i = 0; i < genres.length; i++) {
				var myOption = null;


				myOption = document.createElement('option');
				myOption.value = genres[i];
				myOption.text = genres[i];
				mySelect.appendChild(myOption);

			}
			genreDiv.appendChild(mySelect);

			var artistDiv = mainElement.querySelector('#artistChooser');
			var h2 = document.createElement('h2');
			h2.innerHTML = "Artists";
			artistDiv.appendChild(h2);
			mySelect = document.createElement('select');
			mySelect.multiple = true;
			mySelect.name = "artist";
			mySelect.classList.add("customScrollBar", "multipleSelect")
			for (let i = 0; i < artists.length; i++) {
				var myOption = null;
				myOption = document.createElement('option');
				myOption.value = artists[i];
				myOption.text = artists[i];
				mySelect.appendChild(myOption);

			}
			artistDiv.appendChild(mySelect);

			var compressionSlider = document.getElementById("compressionExponentRange");
			var compressionRatioOutput = document.getElementById("compressionRatio");
			compressionRatioOutput.value = "1.0";
			console.log(compressionRatioOutput.value);

			compressionSlider.oninput = event => { 
				compressionRatioOutput.value = Math.pow(2,compressionSlider.value); 
				console.log(compressionRatioOutput.value);
			}
		}
	});
	
	
	// by ending delete the first element in track array
	Object.defineProperty(ServerRadioController.prototype, 'switchAudioSource', {
		enumerable: false,
		configurable: false,
		value: function() {
			this.leftAudioSource = this.rightAudioSource;
			this.leftGainNode = this.rightGainNode;
			this.tracks.shift();
			if(this.tracks.length==0) end = true;
			console.log("Tracks nach Shift: " + this.tracks);
		}
	});
	
	
	
	Object.defineProperty(ServerRadioController.prototype, 'playAudio', {
		enumerable: false,
		configurable: false,
		value: async function(index) {
			let source = null;
			if(!end){
			try {
				let identity = this.tracks[index].recordingReference;
				let compressionRatio = document.getElementById("compressionRatio").value;
				let uri = '/services/documents/' + identity;
				if(compressionRatio != "1.0") uri+= "?audioCompressionRatio=" + compressionRatio;

				let response = await fetch(uri, {
					method: 'GET', // *GET, POST, PUT, DELETE, etc.
					credentials: 'include', // include, *same-origin, omit
					headers: { Accept: 'audio/*' }
				});
				
				if (!response.ok)
					throw new Error(response.status + ' ' + response.statusText);

				this.leftGainNode = Controller.audioContext.createGain();
				let volumeSlider = document.getElementById("volumeRange");
				let volumeValue = document.getElementById("volumeValue");
				volumeValue.value = volumeSlider.value;
				volumeSlider.oninput = event => {
					volumeValue.value = parseInt((volumeSlider.value * 50),10);
					this.leftGainNode.gain.value = volumeSlider.value;
				}
				
				let buffer = await response.arrayBuffer();
				this.leftAudioSource = Controller.audioContext.createBufferSource();
				let decodedAudio = await Controller.audioContext.decodeAudioData(buffer);
				this.leftAudioSource.buffer = decodedAudio;
				this.leftAudioSource.connect(this.leftGainNode);
				this.leftGainNode.connect(Controller.audioContext.destination);
				this.leftAudioSource.start(0);
				
				const breakPoint = (this.leftAudioSource.buffer.duration - 10.0) * 1000;
				setTimeout(() => this.startFadeIn(1), 20000);
			} catch (error) {
				this.displayError(error);
			}
		  }	
		}
	});

	/**
	 *
	 */
	Object.defineProperty(ServerRadioController.prototype, 'startFadeIn', {
		enumerable: false,
		configurable: false,
		value: async function(index) {
			try {
				//if(this.tracks[index] != null){ return;}
				let identity = this.tracks[index].recordingReference;
				let compressionRatio = document.getElementById("compressionRatio").value;
				let uri = '/services/documents/' + identity;
				if(compressionRatio != "1.0") uri+= "?audioCompressionRatio=" + compressionRatio;

				let response = await fetch(uri, {
					method: 'GET', // *GET, POST, PUT, DELETE, etc.
					credentials: 'include', // include, *same-origin, omit
					headers: { Accept: 'audio/*' }
				}); 
				
				if (!response.ok)
					throw new Error(response.status + ' ' + response.statusText);
			
				let volumeSlider = document.getElementById("volumeRange");
				let volumeValue = document.getElementById("volumeValue");
				volumeValue.innerHTML = volumeSlider.value;

				this.rightGainNode = Controller.audioContext.createGain();
				volumeSlider.oninput = function() {
					volumeValue.innerHTML = parseInt((this.value * 50),10);
					this.rightGainNode.gain.value = this.value;
				}

				this.rightAudioSource = Controller.audioContext.createBufferSource();
				this.rightAudioSource.connect(this.rightGainNode);
				this.rightGainNode.connect(Controller.audioContext.destination);
				
				let buffer = await response.arrayBuffer();
				let decodedAudio = await Controller.audioContext.decodeAudioData(buffer);
				this.rightAudioSource.buffer = decodedAudio;
				
				const breakPoint = (this.rightAudioSource.buffer.duration - 10.0) * 1000;
				setTimeout(() => this.startFadeIn(1), 20000);
				
				this.rightGainNode.gain.setValueAtTime(0 , 0.0)								//FADE IN
				this.rightAudioSource.start(0);
				this.rightGainNode.gain.linearRampToValueAtTime(volumeSlider.value , Controller.audioContext.currentTime + 5.0);	//FADE IN
				this.leftGainNode.gain.linearRampToValueAtTime(0.0,Controller.audioContext.currentTime + 5.0);		//FADE OUT
				
				// this.leftAudioSource.ended = event => this.switchAudioSource();
				setTimeout(() => this.switchAudioSource(), Controller.audioContext.currentTime + 10.0);
				
			} catch (error) {
				this.displayError(error);
			}
		}
});

	/**
	 *
	 */
	Object.defineProperty(ServerRadioController.prototype, 'searchArtistGenre', {
		enumerable: false,
		configurable: false,
		value: async function() {
			this.displayError();
			try {
				//	Get array of all picked artists

				var first_options = document.querySelectorAll("#artistChooser select option:checked");

				var selectedArtists = '';
				if(first_options.length>0){
					for (var i = 0; i < first_options.length; i++) {

						selectedArtists += 'artist=' + first_options[i].value + '&';
					}
				}
				selectedArtists = selectedArtists.slice(0, -1);

				console.log("searhedArtists: ", selectedArtists);
				//	Get array of all picked genres

				var second_options = document.querySelectorAll("#genreChooser select option:checked");
				var selectedGenres = '';
				if(second_options.length>0){
					for (var i = 0; i < second_options.length; i++) {
						selectedGenres += 'genre=' + second_options[i].value + '&';
					}
				}
				selectedGenres = selectedGenres.slice(0, -1);

				console.log("selectedGenres: ", selectedGenres);

				var limit = document.querySelector('#offset_limit').value;
				console.log('limit is now:', limit + ' songs');
				//FETCH!

				let uri = '/services/tracks?';
//				for(let artist of selectedArtists){
//				uri += "artist=" + artist + "&";
//				}
//				for(let genre of selectedGenres){
//				uri += "genre=" + genre + "&";
//				}
				uri+=selectedArtists +"&" +selectedGenres
				uri += "&limit=" + limit;
				console.log(uri);
				let response = await fetch(
						uri,
						{
							method: 'GET', // *GET, POST, PUT, DELETE, etc.
							credentials: 'include', // include, *same-origin, omit
							headers: {Accept: 'application/json'}
						}
				);
				if (!response.ok)
					throw new Error(response.status + ' ' + response.statusText);

				this.tracks = await response.json();
				console.log("Tracks: "+ this.tracks);


				let genreArtistTrackList = document.querySelector('#genreArtistList');
				genreArtistTrackList.innerHTML = '';

				var artistAndTrack = document.getElementById("artistAndTrack");
				var lyricsText = document.getElementById("lyricsText");
				let ol = document.createElement('ol');
				ol.id = 'artistSelect';
				ol.classList.add("customScrollBar");
				this.tracks = shuffle(this.tracks);
				if (this.tracks.length>0){
					for (let track of this.tracks) {		
						let li = document.createElement('li');   
						let img = document.createElement('img');
						img.src = "/services/documents/" + track.albumCoverReference;
						img.classList.add("albumCover");
						let span = document.createElement('span');   
						span.innerHTML = track.artist + " - "+ track.name; //TODO textnode erzeugen

						li.appendChild(img);
						li.appendChild(span);
						ol.appendChild(li);
					}

					ol.firstChild.classList.add("played")
					//this.playAudio(tracks[0].recordingReference);
					// Please change this id to one which you have.
					console.table(this.tracks);
//					this.playAudio(this.tracks[0].recordingReference);
					this.playAudio(0);


				}else{
					var li = document.createElement('i');

					li.innerText = "No Tracks";
					ol.appendChild(li);

					artistAndTrack.innerHTML = "Lyrics :";
					lyricsText.value = "no lyrics";
				}
				genreArtistTrackList.appendChild(ol);


				//lyrics for the first song in the list
				let artist = this.tracks[0].artist;
				let trackName = this.tracks[0].name;

				try {
					const lyrics = await this.queryLyrics(artist, trackName);
					console.log(lyrics);
					artistAndTrack.innerHTML = "Lyrics for " + artist + ", " + trackName;
					lyricsText.value = lyrics.result.track.text;
				} catch (error) {
					this.displayError(error);
					lyricsText.value = "no such song found in database";
				}

			} catch (error) {
				this.displayError(error);
			}
		}
	});

	Object.defineProperty(ServerRadioController.prototype, 'queryLyrics', {
		enumerable: false,
		configurable: false,
		value: async function(artist,trackName) {
			const apikey = "9rKTnZBFvEFwSc6eZHA7a7G7mXsrMyIgu7R4L015Lzv9MG8Af4J3OoI0TJ8VB8xs";
			const resource = "https://orion.apiseeds.com/api/music/lyric/" + artist + "/" + trackName + "?apikey=" + apikey;

			let response = await fetch(resource, { method: 'GET', headers: {"Accept": "application/json"} } );
			if (!response.ok) throw new Error(response.status + ' ' + response.statusText);

			const lyrics = await response.json();
			return lyrics;
		}
	});

	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener('load', event => {
		const anchor = document.querySelector('header li:nth-of-type(2) > a');
		const controller = new ServerRadioController();
		anchor.addEventListener('click', event => controller.display());
	});

	function shuffle(a) {
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}
})();
