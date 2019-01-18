"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;
	
	let peerConnection;
	let sendChannel;
	
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
			
			peerConnection = new RTCPeerConnection();

			sendChannel = peerConnection.createDataChannel("sendChannel");
			console.log('Created send data channel: ', sendChannel);
	
			var context = new AudioContext();
			var reader = new FileReader();		FilreReader as await Promise
			 
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
			 
			        peerConnection.addStream(remote.stream);
			 
			        this.sendOffer();	        
			    });
			});
		}
	});
	/**
	* Creates and offer and send it to the database
	*/
	Object.defineProperty(PeerRadioController.prototype, "sendOffer", {
		enumerable: false,
		configurable: false,
		value: async function () {
			let offerDescription = await this.peerConnection.createOffer();
			this.peerConnection.setLocalDescription(offerDescription);
	
			let timestamp = Date.now()*1000;
			Controller.sessionOwner.lastTransmissionTimestamp = timestamp;
			Controller.sessionOwner.webAdress = JSON.stringify(offerDescription);
			const body = JSON.stringify(Controller.sessionOwner);
	
			let response = await fetch("/services/people", {method: "POST", credentials: "include", body: body, headers: { 'Content-type': 'application/json' }});
			if(!response.ok) throw new Error(response.status + " " + response.statusText);
						
			console.log(Controller.sessionOwner);
							
			console.log("Finish fetch post person");
		}
	});		

	Object.defineProperty(PeerRadioController.prototype, "listen", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
			mainElement.querySelector("#chooseModus").remove();
			
			let fiveMinTimestamp = (Date.now()*1000) - (5 * 60 * 1000);
			let uri = "/services/people?lastTransmissionTimestamp<=" + fiveMinTimestamp;
			
			let response = await fetch(uri,{method: "GET", credentials: "include",headers:{'Accept': 'application/json'}});
			if(!response.ok) throw new Error(response.status + " " + response.statusText);
			
			let sendingPersons = await response.json();
			
			if(sendingPersons == null){
				console.log("no one is sending currently");
			}
			
			for(let person of sendingPersons){
				let btn = document.createElement("BUTTON");
				let t = document.createTextNode(person.surname);      
				btn.appendChild(t);                                
				mainElement.appendChild(btn);                   
				btn.addEventListener("click", event => this.startListen());
			}	
		}
	});
	
	/*Object.defineProperty(PeerRadioController.prototype, "playNext", {
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
	});*/
	


	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		const anchor = document.querySelector("header li:nth-of-type(3) > a");
		const controller = new PeerRadioController();
		anchor.addEventListener("click", event => controller.display());
	});
	
} ());
