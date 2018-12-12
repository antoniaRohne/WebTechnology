"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;

	let localConnection;
	let sendChannel;
	
	/**
	 * Creates a new welcome controller that is derived from an abstract controller.
	 */
	const PeerRadioController = function () {
		Controller.call(this);
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
			const mainElement = document.querySelector("main");
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

			const mainElement = document.querySelector("main");
			
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
			//sendChannel.onopen = handleSendChannelStatusChange;
			//sendChannel.onclose = handleSendChannelStatusChange;
		}
	});
	
	Object.defineProperty(PeerRadioController.prototype, "listen", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
			
		}
	});

	Object.defineProperty(PeerRadioController.prototype, "startTracks", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: async function () {
			const mainElement = document.querySelector("main");
			var files = mainElement.querySelector("#fileChooser").files;
			let fileList = document.createElement('ul');
			
			for(let i=0; i<files.length;i++){
				let fileEntry = document.createElement('li');
				fileEntry.innerHTML = files[i].name;
				fileList.appendChild(fileEntry);
			}	
			
			mainElement.appendChild(fileList);
			
			let audioPlayer = document.createElement("audio");
			audioPlayer.source = URL.createObjectURL(files[0]);
			mainElement.appendChild(audioPlayer);
			audioPlayer.play();
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
