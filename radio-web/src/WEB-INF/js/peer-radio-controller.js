"use strict";
import Controller from "./controller.js";

// consts
const FIVE_MINUTE_MILLIS = 5 * 60 * 1000;	

/**
 * Creates a new welcome controller that is derived from an abstract
 * controller.
 */
let PeerRadioController = function () {
	Controller.call(this);
	Object.defineProperty(this, "address", { enumerable : true,  writable: true, value: null });
	Object.defineProperty(this, "connection", { enumerable : true,  writable: true, value: null });
	Object.defineProperty(this, "channel", { enumerable : true,  writable: true, value: null });
	Object.defineProperty(this, "files", { enumerable : true,  writable: true, value: null });
	Object.defineProperty(this, "index", { enumerable : true,  writable: true, value: 0 });
	Object.defineProperty(this, "answered", { enumerable : true,  writable: true, value: false });
	Object.defineProperty(this, "mainElement", { enumerable : true,  writable: true, value: document.querySelector("main")});
	Object.defineProperty(this, "gainNode", { enumerable : true,  writable: true, value: null });
	Object.defineProperty(this, "audioSource", { enumerable : true,  writable: true, value: null });
}

PeerRadioController.prototype = Object.create(Controller.prototype);
PeerRadioController.prototype.constructor = PeerRadioController;


/**
 * Displays the associated view.
 */
Object.defineProperty(PeerRadioController.prototype, "display", {
	writable: true,
	value: async function () {

		if(!this.audioContext) this.audioContext = new AudioContext();

		if(!this.sessionOwner){
			let anchor = document.querySelector("header li:nth-of-type(1) > a");
			anchor.dispatchEvent(new MouseEvent("click"));
			return;
		}

		this.mainElement.appendChild(document.querySelector("#peer-radio-template").content.cloneNode(true).firstElementChild);

		this.mainElement.querySelector("#sendButton").addEventListener("click", event => this.sendModus());
		this.mainElement.querySelector("#receiveButton").addEventListener("click", event => this.listen());
	}
});

Object.defineProperty(PeerRadioController.prototype, "sendModus", {
	writable: true,
	value: async function () {

		if(this.mainElement.children.length >= 2)
			this.mainElement.removeChild(this.mainElement.lastChild);

		console.log(this.mainElement.children.length >= 2);
		this.mainElement.appendChild(document.querySelector("#send_section").content.cloneNode(true).firstElementChild);

		let fileChooser =  this.mainElement.querySelector("#fileChooser");
		console.log(fileChooser);
		fileChooser.addEventListener("change", event => this.showTracks());
	}
});

Object.defineProperty(PeerRadioController.prototype, "showTracks", {
	value: async function () {
		this.files = this.mainElement.querySelector("#fileChooser").files;
		let fileList = this.mainElement.querySelector('select');

		for(let i=0; i<this.files.length;i++){
			let fileEntry = document.createElement('option');
			fileEntry.value = this.files[i];
			fileEntry.text = this.files[i].name;
			fileList.appendChild(fileEntry);
			console.log(fileEntry.value);
		}	
		console.log("current index: " + this.index);
		this.playSong(this.files[this.index]);
		
		/*fileList.classList.add("customScrollBar");
		fileList.addEventListener("change", event => {
			let selected = this.mainElement.querySelector('select');
			let value = selected.options[selected.selectedIndex].value;
			this.playSong(value,true);
		});*/

	}
});

Object.defineProperty(PeerRadioController.prototype, "playSong", {
	writable: true,
	value: async function (file) {
		this.sendOffer();
		let buffer = await readAsArrayBuffer(file);
		this.audioSource = this.audioContext.createBufferSource();
		let decodedAudio = await this.audioContext.decodeAudioData(buffer);
		this.audioSource.buffer = decodedAudio;
		this.gainNode = this.audioContext.createGain();
		this.audioSource.connect(this.gainNode);
		this.gainNode.connect(this.audioContext.destination);
		this.audioSource.start();
		this.index++;
		//setTimeout(() => this.playNext(this.files[this.index]), this.audioSource.buffer.duration);
	}
});

Object.defineProperty(PeerRadioController.prototype, "playNext", {
	writable: true,
	value: async function (file) {

		this.updateOffer();
		let buffer = await readAsArrayBuffer(file);
		let decodedAudio = await this.audioContext.decodeAudioData(buffer);
		this.audioSource.buffer = decodedAudio;
		this.audioSource.start();
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
	writable: true,
	value: async function () {
		if (this.connection) this.connection.close();
		this.connection = new RTCPeerConnection();
		this.channel = this.connection.createDataChannel("offer");

		let offer = await negotiateLocalDescription(this.connection, true);
		let sdp = offer.sdp;
		if (this.address) sdp = sdp.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, this.address);

		this.sessionOwner.negotiation = { offer: sdp, timestamp: Date.now() };
		const body = JSON.stringify(this.sessionOwner);
		console.log(this.sessionOwner.identity + " " + this.sessionOwner.email);

		let response = await fetch("/services/people", {method: "POST", credentials: "include", body: body, headers: { 'Content-type': 'application/json' }});
		if(!response.ok) throw new Error(response.status + " " + response.statusText);

		console.log("Finish sendOffer");
		console.log("start looking for Answer");
		this.searchForAnswer();
	}
});		

/**
 * Updates timestamp every song
 */
Object.defineProperty(PeerRadioController.prototype, "updateOffer", {
	writable: true,
	value: async function () {

		let timestamp = Date.now()*1000;
		this.sessionOwner.lastTransmissionTimestamp = timestamp;
		const body = JSON.stringify(this.sessionOwner);
		console.log(this.sessionOwner.identity + " " + this.sessionOwner.email);

		let response = await fetch("/services/people", {method: "POST", credentials: "include", body: body, headers: { 'Content-type': 'application/json' }});
		if(!response.ok) throw new Error(response.status + " " + response.statusText);

		console.log("Finish updateOffer");
	}
});	

Object.defineProperty(PeerRadioController.prototype, "acceptOffer", {
	writable: true,
	value: async function (person) {	
		if (this.connection) this.connection.close();
		this.connection = new RTCPeerConnection();
		this.connection.ondatachannel = this.handleReceiveChannelOpened;

		let offer = { type: "offer", sdp: person.negotiation.offer };
		await this.connection.setRemoteDescription(offer);
		let answer = await negotiateLocalDescription(this.connection, false);
		let sdp = answer.sdp;
		if (this.address) sdp = sdp.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, this.address);

		this.sessionOwner.negotiation = { offer: sdp, answer: sdp, timestamp: Date.now() };
		const body = JSON.stringify(this.sessionOwner);
		console.log(this.sessionOwner.identity + " " + this.sessionOwner.email);

		let response = await fetch("/services/people", {method: "POST", credentials: "include", body: body, headers: { 'Content-type': 'application/json' }});
		if(!response.ok) throw new Error(response.status + " " + response.statusText);

		console.log("Finish acceptOffer");
	}
});

Object.defineProperty(PeerRadioController.prototype, "searchForAnswer", {
	writable: true,
	value: async function () {
		let queryBuilder = new URLSearchParams();
		queryBuilder.set("negotiatingAnswer", true);
		queryBuilder.set("negotiationOffer", this.connection.localDescription.sdp);
		let uri = "/services/people?" + queryBuilder.toString();

		let response = await fetch(uri,{method: "GET", credentials: "include", headers:{'Accept': 'application/json'}});
		if(!response.ok) throw new Error(response.status + " " + response.statusText);
		
		let answeringPeople = await response.json();
		if(answeringPeople.length > 0){this.acceptAnswer(answeringPeople[0]);}
		console.log("answered = " + this.answered);
		if(!this.answered) setTimeout(() => this.searchForAnswer(), 5000);
	}
});

Object.defineProperty(PeerRadioController.prototype, "acceptAnswer", {
	writable: true,
	value: async function (person) {
		this.answered = true;
		console.log("Accepted answer!");
		let answer = { type: "answer", sdp: person.negotiation.answer };
		await this.connection.setRemoteDescription(answer);
		let buffer = await readAsArrayBuffer(this.files[0]);
		setTimeout(() => this.sendMessage(buffer), 5000);
	}
});

Object.defineProperty(PeerRadioController.prototype, "sendMessage", {
	writable: true,
	value: function (buffer) {
		if(this.channel.readyState == "open")
		this.channel.send(buffer);
	}
});

Object.defineProperty(PeerRadioController.prototype, "closeChannel", {
	writable: true,
	value: function () {
		if (!this.channel) {
			this.channel.close();
			this.channel = null;
		}
	}
});

Object.defineProperty(PeerRadioController.prototype, "handleReceiveChannelOpened", {
	writable: true,
	value: function (event) {
		console.log("channel opened");
		this.channel = event.channel;
		this.channel.addEventListener("close", event => this.handleReceiveChannelClosed());
	 	this.channel.onmessage = async function (event) {
	 		console.log("handle message");
	 		if(this.audioSource == null){ //getting multiple messages
				this.audioSource = this.audioContext.createBufferSource();
				let decodedAudio = await this.audioContext.decodeAudioData(event.data);
				this.audioSource.buffer = decodedAudio;
				this.gainNode = this.audioContext.createGain();
				this.audioSource.connect(this.gainNode);
				this.gainNode.connect(this.audioContext.destination);
				this.audioSource.start();
				console.log("started song");
	 		}
		}
	}
}); 

function negotiateLocalDescription (connection, offerMode){
	return new Promise(async(resolve, reject) => {
		connection.onicecandidate = event => {
			if(!event.candidate){
				delete connection.icecandidate;
				resolve(connection.localDescription);
			}
		};
		
		if(offerMode){
			let offer = await connection.createOffer();
			await connection.setLocalDescription(offer);
		}else{
			let answer = await connection.createAnswer();
			await connection.setLocalDescription(answer);
		}
	});
}

Object.defineProperty(PeerRadioController.prototype, "listen", {
	writable: true,
	value: async function () {

		if(this.mainElement.children.length >= 2)
			this.mainElement.removeChild(this.mainElement.lastChild);

		this.mainElement.appendChild(document.querySelector("#recieve-section-template").content.cloneNode(true).firstElementChild);

		let queryBuilder = new URLSearchParams();
		queryBuilder.set("lowerNegotiationTimestamp", Date.now() - FIVE_MINUTE_MILLIS);
		queryBuilder.set("negotiatingOffer", true);
		let uri = "/services/people?" + queryBuilder.toString();

		let response = await fetch(uri,{method: "GET", credentials: "include", headers:{'Accept': 'application/json'}});
		if(!response.ok) throw new Error(response.status + " " + response.statusText);

		let sendingPeople = await response.json();
		console.log("sending people: "  + sendingPeople);
		let peopleDiv = this.mainElement.querySelector('div.recieve-section');
		for(let person of sendingPeople){
			let anchor = document.createElement('a');
			let img = document.createElement('img');
			img.title = person.forename +" "+ person.surname;
			img.src = "/services/documents/" + person.avatarReference;
			anchor.appendChild(img);
			anchor.addEventListener('click', event => this.acceptOffer(person));
			this.mainElement.appendChild(anchor);
		}	
	}
});

Object.defineProperty(PeerRadioController.prototype, "refreshAdress", {
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
	let anchor = document.querySelector("header li:nth-of-type(3) > a");
	let controller = new PeerRadioController();
	anchor.addEventListener("click", event => controller.display());
});