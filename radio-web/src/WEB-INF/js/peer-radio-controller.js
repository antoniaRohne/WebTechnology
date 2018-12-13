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
			mainElement.appendChild(document.querySelector("#peer-radio-template").content.cloneNode(true).firstElementChild);
			mainElement.querySelector("#sendButton").addEventListener("click", event => this.send());
			mainElement.querySelector("#receiveButton").addEventListener("click", event => this.listen());
		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "send", {
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
			
			
			localConnection = new RTCPeerConnection();

			sendChannel = localConnection.createDataChannel("sendChannel");
			/*endChannel.onopen = handleSendChannelStatusChange;
			sendChannel.onclose = handleSendChannelStatusChange;
			
			remoteConnection = new RTCPeerConnection();
			remoteConnection.ondatachannel = receiveChannelCallback;
			
			localConnection.onicecandidate = e => !e.candidate || remoteConnection.addIceCandidate(e.candidate).catch(handleAddCandidateError);
			remoteConnection.onicecandidate = e => !e.candidate || localConnection.addIceCandidate(e.candidate).catch(handleAddCandidateError);
			
			localConnection.createOffer()
			.then(offer => localConnection.setLocalDescription(offer))
			.then(() => remoteConnection.setLocalDescription(localConnection.localDescription))
			.then(() => remoteConnection.createAnswer())
			.then(answer => remoteConnection.setLocalDescription(answer))
			.then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
			.catch(handleCreateDescriptionError);
			
			sendChannel.send(xxx);
			
			Disconnect => close channels and then connections with .close */
		}
	});
	
	function receiveChannelCallback(event){
		receiveChannel = event.channel;
		//receiveChannel.onmessage(handleReceiveMessage);
		//receiveChannel.onopen = handleReceiveChannelStatusChange;
		//receiveChannel.onclose = handleReceiveChannelStatusChange;
	}
	
	Object.defineProperty(PeerRadioController.prototype, "listen", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
			mainElement.querySelector("#chooseModus").remove();
			
			let sendingPersons = await fetch("/services/people?sending=1", {
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
			
			let personList = document.createElement('ul');
			
			for(let person of sendingPersons){
				let personEntry = document.createElement('li');
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
		writable: true,
		value: async function () {
			
			files = mainElement.querySelector("#fileChooser").files;
			let fileList = document.createElement('ul');
			
			for(let i=0; i<files.length;i++){
				let fileEntry = document.createElement('li');
				fileEntry.innerHTML = files[i].name;
				fileList.appendChild(fileEntry);
			}	
			
			mainElement.appendChild(fileList);
			
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
	});
	
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
			
		}
	});
	
	
	
	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		const anchor = document.querySelector("header li:nth-of-type(3) > a");
		const controller = new PeerRadioController();
		anchor.addEventListener("click", event => controller.display());
	});
	
    
} ());
