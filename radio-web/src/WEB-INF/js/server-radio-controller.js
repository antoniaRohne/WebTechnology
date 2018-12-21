/**
 * WelcomeController: radio welcome controller.
 * Copyright (c) 2018 Sascha Baumeister
 */
'use strict';

(function() {
  // imports
  const Controller = de_sb_radio.Controller;

  let AUDIO_CONTEXT = window.AudioContext || window.webkitAudioContext;
  let audioContext = new AUDIO_CONTEXT();
  
  var source = null;
  var myAudio = document.querySelector('audio');
  var gainNode = null;

  /**
   * Creates a new welcome controller that is derived from an abstract controller.
   */
  const ServerRadioController = function() {
    Controller.call(this);
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
      this.displayError();
      var genres,artists = [];

      try {
        //var genres = JSON.parse(await this.xhr("/services/tracks/genres?offset=0&limit=100", "GET", {"Accept": "application/json"}, "", "text", "ines.bergmann@web.de", "ines"));
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
        //	var artists = JSON.parse(await this.xhr("/services/tracks/artists", "GET", {"Accept": "application/json"}, "", "text", "ines.bergmann@web.de", "ines"));
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
    	    if (el.tagName.toLowerCase() == 'option' && el.parentNode.hasAttribute('multiple')) {
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
     mySelect.classList.add("customScrollBar")
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
      mySelect.classList.add("customScrollBar")
      for (let i = 0; i < artists.length; i++) {
        var myOption = null;
        myOption = document.createElement('option');
        myOption.value = artists[i];
        myOption.text = artists[i];
        mySelect.appendChild(myOption);
     
      }
      artistDiv.appendChild(mySelect);
      
     
    	
      var compressionSlider = document.getElementById("compressionRange");
      var compressionValue = document.getElementById("compressionValue");
      compressionValue.innerHTML = compressionSlider.value;
      
      compressionSlider.oninput = function() {
    	  compressionValue.innerHTML = this.value;
      }
      
      
    }
  });

  Object.defineProperty(ServerRadioController.prototype, 'playAudio', {
    enumerable: false,
    configurable: false,
    value: async function(identity) {
      try {
        let response = await fetch('/services/documents/' + identity, {
          method: 'GET', // *GET, POST, PUT, DELETE, etc.
          credentials: 'include', // include, *same-origin, omit
          headers: { Accept: 'audio/*' }
        });
        if (!response.ok)
            throw new Error(response.status + ' ' + response.statusText);

        let buffer = await response.arrayBuffer();
        
        if(source != null)
        	source.stop(0);
        source = audioContext.createBufferSource();
        gainNode = audioContext.createGain();
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        var volumeSlider = document.getElementById("volumeRange");
        var volumeValue = document.getElementById("volumeValue");
        volumeValue.innerHTML = volumeSlider.value;
        
        volumeSlider.oninput = function() {
      	  volumeValue.innerHTML = parseInt((this.value * 50),10);
      	  gainNode.gain.value = this.value;
        }

        audioContext.decodeAudioData(buffer, decodedData => {
          //Alternative await decodeAudioData
          source.loop = false;
          source.buffer = decodedData;
          source.start(0);
        });
        
        
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
      var tracks = [];
      try {
        //	Get array of all picked artists
      
        var first_options = document.querySelectorAll("#artistChooser select option:checked");
       
        var searchedArtists = '';
        if(first_options.length>0){
	        for (var i = 0; i < first_options.length; i++) {
	       
	            searchedArtists += 'artist=' + first_options[i].value + '&';
	        }
        }
        searchedArtists = searchedArtists.slice(0, -1);
        
        console.log("searhedArtists: ", searchedArtists);
        //	Get array of all picked genres
        
        var second_options = document.querySelectorAll("#genreChooser select option:checked");
        var searchedGenres = '';
        if(second_options.length>0){
	        for (var i = 0; i < second_options.length; i++) {
	            searchedGenres += 'genre=' + second_options[i].value + '&';
	        }
        }
        searchedGenres = searchedGenres.slice(0, -1);
        
        console.log("searchedGenres: ", searchedGenres);
        
        var limit = document.querySelector('#offset_limit').value;
        console.log('limit is now:', limit + ' songs');
        //FETCH!
        var response = await fetch(
          '/services/tracks?' +
            searchedArtists +
            '&' +
            searchedGenres +
            '&limit=' +
            limit,
          {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, *same-origin, omit
            headers: {
              Accept: 'application/json',
              'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
            //body: JSON.stringify(data), // body data type must match "Content-Type" header
          }
        );
        if (!response.ok)
          throw new Error(response.status + ' ' + response.statusText);

         tracks = await response.json();

        console.log(tracks);
      } catch (error) {
        this.displayError(error);
      }

      let genreArtistTrackList = document.querySelector('#genreArtistList');
      genreArtistTrackList.innerHTML = '';
    

      let ol = document.createElement('ol');
      ol.id = 'artistSelect';
      ol.classList.add("customScrollBar");
      tracks = shuffle(tracks);
      if (tracks.length>0){
    	  for (let track of tracks) {
    	        var li = document.createElement('li');
    	        
    	        li.innerText = track.artist + " - "+ track.name;
    	        
    	        ol.appendChild(li);
    	      }
    	     
    	      ol.firstChild.classList.add("played")
    	      //this.playAudio(tracks[0].recordingReference);
    	      // Please change this id to one which you have.
    	      this.playAudio(23);
      }else{
    	  var li = document.createElement('i');
	      
	        li.innerText = "No Tracks";
	        ol.appendChild(li);
      }
      genreArtistTrackList.appendChild(ol);
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
