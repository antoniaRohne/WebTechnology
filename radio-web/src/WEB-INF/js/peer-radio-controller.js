"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;

	let nextId = 0;
	let files;

	let mainElement;
	
	let context;
	let audioSource;
	let gainNode;

	/**
	 * Creates a new welcome controller that is derived from an abstract
	 * controller.
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
				this.playSong(value);
			});

		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "playSong", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function (file) {

			this.sendOffer();
			context = new AudioContext();
			let buffer = await readAsArrayBuffer(file);
			audioSource = Controller.audioContext.createBufferSource();
			let decodedAudio = await Controller.audioContext.decodeAudioData(buffer);
			audioSource.buffer = decodedAudio;
			gainNode = Controller.audioContext.createGain();
			audioSource.connect(gainNode);
			gainNode.connect(Controller.audioContext.destination);
			audioSource.start();
			setTimeout(() => this.playNext(null), this.audioSource.buffer.duration);
		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "playNext", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function (file) {

			this.updateOffer();
			let buffer = await readAsArrayBuffer(file);
			let decodedAudio = await Controller.audioContext.decodeAudioData(buffer);
			audioSource.buffer = decodedAudio;
//			gainNode = Controller.audioContext.createGain();
//			audioSource.connect(gainNode);
//			gainNode.connect(Controller.audioContext.destination);
			audioSource.start();
			setTimeout(() => this.playNext(null), this.audioSource.buffer.duration);
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

			console.log("Finish sendOffer");
		}
	});		
	
	/**
	 * Updates timestamp every song
	 */
	Object.defineProperty(PeerRadioController.prototype, "updateOffer", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {

			let timestamp = Date.now()*1000;
			Controller.sessionOwner.lastTransmissionTimestamp = timestamp;
			const body = JSON.stringify(Controller.sessionOwner);

			let response = await fetch("/services/people", {method: "POST", credentials: "include", body: body, headers: { 'Content-type': 'application/json' }});
			if(!response.ok) throw new Error(response.status + " " + response.statusText);

			console.log("Finish updateOffer");
		}
	});	
	
	Object.defineProperty(PeerRadioController.prototype, "acceptOffer", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function (sdp) {
		if (sdp.length === 0) return;

		if (this.connection) this.connection.close();
		this.connection = new RTCPeerConnection();
		this.connection.addEventListener("icecandidate", event => this.handleIceCandidate(event.candidate));
		this.connection.addEventListener("datachannel", event => this.handleReceiveChannelOpened(event.channel));

		let offer = new RTCSessionDescription({ type: "offer", sdp: sdp });
		await this.connection.setRemoteDescription(offer);
		let answer = await this.connection.createAnswer();
		await this.connection.setLocalDescription(answer);
		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "sendMessage", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: function (data) {
		this.channel.send(data);
		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "closeChannel", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: function () {
		if (!this.channel) {
			this.channel.close();
			this.channel = null;
		}
		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "handleIceCandidate", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function (iceCandidate) {
		if (iceCandidate) return;

		let sdp = this.connection.localDescription.sdp;
		if (this.address) sdp = sdp.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, this.address);
		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "handleReceiveChannelOpened", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: function (channel) {
	   	channel.addEventListener("close", event => this.handleReceiveChannelClosed());
	 	channel.addEventListener("message", event => this.handleMessageReceived(event.data));
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


			let fiveMinAgoTimestamp = Date.now() - (5*60*1000);
			let uri = "/services/people?lastTransmissionTimestamp>=" + fiveMinAgoTimestamp;

			let response = await fetch(uri,{method: "GET", credentials: "include", headers:{'Accept': 'application/json'}});
			if(!response.ok) throw new Error(response.status + " " + response.statusText);

			let sendingPersons = await response.json();
			console.log("SendingPersons: "  + sendingPersons);
			let personList = mainElement.querySelector('select');

			for(let i=0; i<sendingPersons.length;i++){
				let personEntry = document.createElement('option');
				personEntry.value = sendingPersons[i].webAdress;
				personEntry.text = sendingPersons[i].surname;
				personList.appendChild(personEntry);
			}	
			
			personList.classList.add("customScrollBar");
			personList.addEventListener("change", event => {
				let selected = mainElement.querySelector('select');
				let value = selected.options[selected.selectedIndex].value;
				this.acceptOffer(value.sdp);
			});
		}
	});

	Object.defineProperty(PeerRadioController.prototype, "refreshAdress", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
		let response = await fetch("https://api.ipify.org/", { method: "GET", headers: { "Accept": "text/plain" }});
		if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
		this.address = await response.text();
		}
	});
	
	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		const anchor = document.querySelector("header li:nth-of-type(3) > a");
		const controller = new PeerRadioController();
		controller.refreshAdress;
		anchor.addEventListener("click", event => controller.display());
	});

} ());
