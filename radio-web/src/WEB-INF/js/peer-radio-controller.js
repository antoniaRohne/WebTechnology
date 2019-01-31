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
	 * Creates a new welcome controller that is derived from an abstract
	 * controller.
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

			if(!Controller.audioContext) Controller.audioContext = new AudioContext();

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

			if(mainElement.children.length >= 2)
				mainElement.removeChild(mainElement.lastChild);

			console.log(mainElement.children.length >= 2);
			mainElement.appendChild(document.querySelector("#send_section").content.cloneNode(true).firstElementChild);



			let fileChooser =  mainElement.querySelector("#fileChooser");
			console.log(fileChooser);
			fileChooser.addEventListener("change", event => this.showTracks());


		}
	});

	Object.defineProperty(PeerRadioController.prototype, "showTracks", {
		enumerable: false,
		configurable: false,
		value: async function () {
			this.files = mainElement.querySelector("#fileChooser").files;
			let fileList = mainElement.querySelector('select');

			for(let i=0; i<this.files.length;i++){
				let fileEntry = document.createElement('option');
				fileEntry.value = this.files[i];
				fileEntry.text = this.files[i].name;
				fileList.appendChild(fileEntry);
				console.log(fileEntry.value);
			}	
			fileList.classList.add("customScrollBar");
			fileList.addEventListener("change", event => {
				let selected = mainElement.querySelector('select');
				let value = selected.options[selected.selectedIndex].value;
				console.log(name,value);
				this.playSong(value);
			});

		}
	});
	Object.defineProperty(PeerRadioController.prototype, "playSong", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function (file) {

			var context = new AudioContext();
			console.log(file);
			let buffer = await readAsArrayBuffer(file);
			let audioSource = Controller.audioContext.createBufferSource();
			let decodedAudio = await Controller.audioContext.decodeAudioData(buffer);
			audioSource.buffer = decodedAudio;
			let gainNode = Controller.audioContext.createGain();
			audioSource.connect(gainNode);
			gainNode.connect(Controller.audioContext.destination);
			audioSource.start();

		}
	});

	/**
	 * Returns a promise of array buffer content read from the given file,
	 * which can be evaluated using the await command. The latter throws an
	 * error if reading said file fails.
	 * @param {File} file the file to be read
	 * @return {Promise} the promise of array buffer content read from the given file
	 */ 
	function readAsArrayBuffer (file) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsArrayBuffer(file);
		});
	}


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

			if(mainElement.children.length >= 2)
				mainElement.removeChild(mainElement.lastChild);

			mainElement.appendChild(document.querySelector("#recieve_section").content.cloneNode(true).firstElementChild);


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

	/*
	 * Object.defineProperty(PeerRadioController.prototype, "playNext", {
	 * enumerable: false, configurable: false, writable: true, value: async
	 * function () { let audioPlayer = mainElement.querySelector("#player");
	 * audioPlayer.pause();
	 * mainElement.querySelector("ul").childNodes[nextId].classList.remove("selected");
	 * nextId++;
	 * audioPlayer.setAttribute("src",URL.createObjectURL(files[nextId]));
	 * mainElement.querySelector("ul").childNodes[nextId].classList.add("selected");
	 * audioPlayer.play(); } });
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
