"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;
	
	let nextId = 0;
	let files;
	
	let mainElement;
	
	/**
	 * Creates a new welcome controller that is derived from an abstract controller.
	 */
	const PeerRadioController = function () {
		Controller.call(this);
		Object.defineProperty(this, "address", { enumerable : true,  writable: true, value: null });
		Object.defineProperty(this, "connection", { enumerable : true,  writable: true, value: null });
		Object.defineProperty(this, "channel", { enumerable : true,  writable: true, value: null });
		
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
			
			for(let i=0; i<this.files.length;i++){
				let fileEntry = document.createElement('li');
				fileEntry.innerHTML = this.files[i].name;
				fileList.appendChild(fileEntry);
			}	
			
			mainElement.appendChild(fileList);
			
			connection = new RTCPeerConnection();
			var reader = new FileReader();
			 
			reader.onload = (function(readEvent) {
				Controller.audioContext.decodeAudioData(readEvent.target.result, function(buffer) {
					var source = Controller.audioContext.createBufferSource();
			        source.buffer = buffer;
					//.addEventListener("ended", this.playNext);
			        source.connect(Controller.audioContext.destination);
			        source.start(0);
			        //mainElement.querySelector("ul").childNodes[nextId].classList.add("played");
			        this.sendOffer(buffer);	        
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
		writable: true,
		value: async function () {
		if (this.connection) this.connection.close();
		this.connection = new RTCPeerConnection();
		this.connection.addEventListener("icecandidate", event => this.handleIceCandidate(event.candidate));
		this.channel = this.connection.createDataChannel("offer");

		let offer = await this.connection.createOffer();
		await this.connection.setLocalDescription(offer);	
		
		let timestamp = Date.now()*1000;
		Controller.sessionOwner.lastTransmissionTimestamp = timestamp;
		Controller.sessionOwner.webAdress = JSON.stringify(offer.sdp);
		const body = JSON.stringify(Controller.sessionOwner);

		let response = await fetch("/services/people", {method: "POST", credentials: "include", body: body, headers: { 'Content-type': 'application/json' }});
		if(!response.ok) throw new Error(response.status + " " + response.statusText);
		
		console.log("Finish send offer");
	}});
	

	Object.defineProperty(PeerRadioController.prototype, "handleIceCandidate", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function (iceCandidate) {
		if (iceCandidate) return;

		let sdp = this.connection.localDescription.sdp;
		if (this.address) sdp = sdp.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, this.address);
	}});

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
	
	// refresh with global IP address of local machine
	PeerRadioController.refreshAddress = async function () {
		let response = await fetch("https://api.ipify.org/", { method: "GET", headers: { "Accept": "text/plain" }});
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		this.address = await response.text();
	}

	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		controller.refreshAddress();
		const anchor = document.querySelector("header li:nth-of-type(3) > a");
		const controller = new PeerRadioController();
		anchor.addEventListener("click", event => controller.display());
	});
	
} ());
