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

      try {
        //var genres = JSON.parse(await this.xhr("/services/tracks/genres?offset=0&limit=100", "GET", {"Accept": "application/json"}, "", "text", "ines.bergmann@web.de", "ines"));
        var genres = await fetch('/services/tracks/genres?offset=0&limit=100', {
          method: 'GET', // *GET, POST, PUT, DELETE, etc.
          credentials: 'include', // include, *same-origin, omit
          headers: {
            Accept: 'application/json',
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        })
          .then(res => res.json())
          .catch(function(error) {
            console.log(error);
          });

        //	var artists = JSON.parse(await this.xhr("/services/tracks/artists", "GET", {"Accept": "application/json"}, "", "text", "ines.bergmann@web.de", "ines"));
        var artists = await fetch('/services/tracks/artists', {
          method: 'GET', // *GET, POST, PUT, DELETE, etc.
          credentials: 'include', // include, *same-origin, omit
          headers: {
            Accept: 'application/json',
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        })
          .then(res => res.json())
          .catch(function(error) {
            console.log(error);
          });
      } catch (error) {
        this.displayError(error);
      }

      const mainElement = document.querySelector('main');
      mainElement.appendChild(
        document.querySelector('#server-radio-template').content.cloneNode(true)
          .firstElementChild
      );
      mainElement
        .querySelector('.buttonGenreArtistSearch')
        .addEventListener('click', event => this.searchArtistGenre());

      var genreDiv = mainElement.querySelector('#genreChooser');

      for (let i = 0; i < genres.length; i++) {
        var myC = null;
        var myL = null;

        myC = document.createElement('INPUT');
        myC.type = 'checkbox';
        myC.checked = false;
        myC.id = genres[i];
        myL = document.createElement('LABEL');
        myL.innerHTML = genres[i];

        myL.appendChild(myC);
        genreDiv.appendChild(myL);
      }

      var artistDiv = mainElement.querySelector('#artistChooser');

      for (let i = 0; i < artists.length; i++) {
        var myC = null;
        var myL = null;

        myC = document.createElement('INPUT');
        myC.type = 'checkbox';
        myC.checked = false;
        myC.id = artists[i];
        myL = document.createElement('LABEL');
        myL.innerHTML = artists[i];

        myL.appendChild(myC);
        artistDiv.appendChild(myL);
      }
      
      var volumeSlider = document.getElementById("volumeRange");
      var volumeValue = document.getElementById("volumeValue");
      volumeValue.innerHTML = volumeSlider.value;
      
      volumeSlider.oninput = function() {
    	  volumeValue.innerHTML = parseInt((this.value * 50),10);
    	  gainNode.gain.value = this.value;
      }
    	
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

        let buffer = await response.arrayBuffer();
        
        if(source != null)
        	source.stop(0);
        source = audioContext.createBufferSource();
        gainNode = audioContext.createGain();
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

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
        var artistDiv = document.querySelector('#artistChooser');
        var checkboxes = artistDiv.querySelectorAll("input[type='checkbox']");
        var searchedArtists = '';
        for (var i = 0; i < checkboxes.length; i++) {
          if (checkboxes[i].checked == true) {
            searchedArtists += 'artist=' + checkboxes[i].id + '&';
          }
        }
        searchedArtists = searchedArtists.slice(0, -1);

        //	Get array of all picked genres
        var genreDiv = document.querySelector('#genreChooser');
        var checkboxes = genreDiv.querySelectorAll("input[type='checkbox']");
        var searchedGenres = '';
        for (var i = 0; i < checkboxes.length; i++) {
          if (checkboxes[i].checked == true) {
            searchedGenres += 'genre=' + checkboxes[i].id + '&';
          }
        }
        searchedGenres = searchedGenres.slice(0, -1);
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
      tracks = shuffle(tracks);
      for (let track of tracks) {
        var li = document.createElement('li');
        li.innerText = track.name;
        ol.appendChild(li);
      }
      genreArtistTrackList.appendChild(ol);
      ol.firstElementChild.classList.add('played');
      //this.playAudio(tracks[0].recordingReference);
      // Please change this id to one which you have.
      this.playAudio(23);
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
