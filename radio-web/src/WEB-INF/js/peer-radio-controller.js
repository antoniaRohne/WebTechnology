"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;
	
	let localConnection;
	let remoteConnection;
	let sendChannel;
	let receiveChannel;
	
	let nextId = 0;
	let files;
	
	let mainElement;
	
	/**
	 * Creates a new welcome controller that is derived from an abstract controller.
	 */
	const PeerRadioController = function () {
		Controller.call(this);
		mainElement = document.querySelector("main");
	}
	PeerRadioController.prototype = Object.create(Controller.prototype);
	PeerRadioController.prototype.constructor = PeerRadioController;


	/**
	 * Displays the associated view.
	 */
	Object.defineProperty(PeerRadioController.prototype, "display", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
			if(!Controller.sessionOwner){
				const anchor = document.querySelector("header li:nth-of-type(1) > a");
				anchor.dispatchEvent(new MouseEvent("click"));
				return;
			}
			
			mainElement.appendChild(document.querySelector("#peer-radio-template").content.cloneNode(true).firstElementChild);
			mainElement.querySelector("#sendButton").addEventListener("click", event => this.sendModus());
			mainElement.querySelector("#receiveButton").addEventListener("click", event => this.listen());
		}
	});
	/*
	
	Object.defineProperty(PeerRadioController.prototype, "sendModus", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
			mainElement.querySelector("#chooseModus").remove();
			
			let fileChooser = document.createElement('input') ;
			fileChooser.type = 'file' ;
			fileChooser.id = "fileChooser";
			fileChooser.accept ="audio/mp3, audio/wav";	
			fileChooser.multiple = true;
			fileChooser.addEventListener("change", event => this.startTracks());
			mainElement.appendChild(fileChooser);
		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "listen", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
			mainElement.querySelector("#chooseModus").remove();
			
			let sendingPersons = await fetch("/services/people", {
		        method: "GET", // *GET, POST, PUT, DELETE, etc.
		        credentials: "include", // include, *same-origin, omit
		        headers: {
		              'Accept': 'application/json',
				'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
		        }
		    }).then(res => res.json()).catch(function (error) {
		        console.log(error);
		       });
			
			let personList = document.createElement('ul');
			
			for(let person of sendingPersons){
				//if(Date.now()-person.lastTransmissionTimestamp<???){
				let personEntry = document.createElement('li'); //=> to buttons so the user can click on ?
				personEntry.innerHTML = person.surname;
				personEntry.addEventListener("click", event => this.startListen());
				personList.appendChild(personEntry);
			}	
			
			mainElement.appendChild(personList);
		}
	});

	Object.defineProperty(PeerRadioController.prototype, "startTracks", {
		enumerable: false,
		configurable: false,
		value: async function () {
			this.files = mainElement.querySelector("#fileChooser").files;
			let fileList = document.createElement('ul');
			
			for(let i=0; i<files.length;i++){
				let fileEntry = document.createElement('li');
				fileEntry.innerHTML = files[i].name;
				fileList.appendChild(fileEntry);
			}	
			
			mainElement.appendChild(fileList);
			
			localConnection = new RTCPeerConnection(); //need something as parameter ?

			sendChannel = localConnection.createDataChannel("sendChannel");
			console.log('Created send data channel: ', sendChannel);
			 
			localConnection.addEventListener('icecandidate', e => onIceCandidate(localConnection, e));
			
			console.log('Peer connection setup complete.');
			
			var context = new AudioContext();
			var reader = new FileReader();
			 
			reader.onload = (function(readEvent) {
				context.decodeAudioData(readEvent.target.result, function(buffer) {
					var source = context.createBufferSource();
			        source.buffer = buffer;
			        source.start(0);
					//.addEventListener("ended", this.playNext);
			        source.connect(context.destination);
			        mainElement.querySelector("ul").childNodes[nextId].classList.add("played");
			        var remote = context.createMediaStreamDestination();
			        source.connect(remote);
			 
			        localConnection.addStream(remote.stream);
			 
			        sendOffer();	        
			    });
			});
			 
			      reader.readAsArrayBuffer(files[nextId]);
	
			if(mainElement.querySelector("#player") == null){
			let audioPlayer = document.createElement("AUDIO");
			audioPlayer.id = "player";
			audioPlayer.setAttribute("src",URL.createObjectURL(files[nextId]));
			mainElement.querySelector("ul").childNodes[nextId].classList.add("selected");
			audioPlayer.addEventListener("ended", this.playNext);
			mainElement.appendChild(audioPlayer);
			audioPlayer.play();
			}
		}
	});*/


	Object.defineProperty(PeerRadioController.prototype, "sendOffer", {
		enumerable: false,
		configurable: false,
		value: async function () {
			let offer = await this.localConnection.createOffer(description => localConnection.setLocalDescription(description));

			let timestamp = Date.now()*1000;
	        const ressource = "/services/people/" + Controller.sessionOwner.identity;
	        const body = JSON.stringify({"lastTransmissionTimestamp": timestamp, "webAdress": description});
	        console.log(ressource);

	        let reponse = await fetch(ressource, { method: "POST", credentials: "include", body: body, headers: { 'Content-type': 'application/json' }});
			if(!response.ok) throw new Error(response.status + " " + response.statusText);
				
			console.log("Finish fetch post person");
		}
	});

	/*
	Object.defineProperty(PeerRadioController.prototype, "playNext", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
			let audioPlayer = mainElement.querySelector("#player");
			audioPlayer.pause();
			mainElement.querySelector("ul").childNodes[nextId].classList.remove("selected");
			nextId++;
			audioPlayer.setAttribute("src",URL.createObjectURL(files[nextId]));
			mainElement.querySelector("ul").childNodes[nextId].classList.add("selected");
			audioPlayer.play();
		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "startListen", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
			localConnection = new RTCPeerConnection();
			localConnection.addEventListener('icecandidate', e => onIceCandidate(localConnection, e));
			localConnection.addEventListener('track', gotRemoteStream);
			
			
		}
	});	

	async function onIceCandidate(pc, event) {
		  const candidate = event.candidate;
		  if (candidate === null) {
		    return;
		  } // Ignore null candidates
		  try {
		    await localConnection.addIceCandidate(candidate);
		    console.log('AddIceCandidate successful: ', candidate);
		  } catch (e) {
		    console.error('Failed to add Ice Candidate: ', e);
		  }
	}
	
	async function handleRemoteDescription(desc) {
		  localConnection.setRemoteDescription(desc);
		  console.log('Offer from localConnection:\n', desc.sdp);
		  try {
		    await localConnection.createAnswer(handleLocalDescription);
		  } catch (e) {
		    console.error('Error when creating remote answer: ', e);
		  }
	}
	
	async function handleLocalDescription(desc) {
		  localConnection.setLocalDescription(desc);
	}
	
	function gotRemoteStream(event) {
		  var player = new Audio();
		  attachMediaStream(player, event.stream);
		  player.play();
		}
	*/
	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		const anchor = document.querySelector("header li:nth-of-type(3) > a");
		const controller = new PeerRadioController();
		anchor.addEventListener("click", event => controller.display());
	});
	
} ());
