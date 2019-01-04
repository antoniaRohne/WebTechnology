"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;
	
	let mainElement;
	let peerConnection;
	
	/**
	 * Creates a new welcome controller that is derived from an abstract controller.
	 */
	const TestController = function () {
		Controller.call(this);
		mainElement = document.querySelector("main");
	}
	TestController.prototype = Object.create(Controller.prototype);
	TestController.prototype.constructor = TestController;


	/**
	 * Displays the associated view.
	 */
	Object.defineProperty(TestController.prototype, "display", {
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
			mainElement.querySelector("#sendButton").addEventListener("click", event => this.setupConnection());
			//mainElement.querySelector("#receiveButton").addEventListener("click", event => this.listen());
		}
	});
	

	/**
	 * 
	 */
	Object.defineProperty(TestController.prototype, "setupConnection", {
		enumerable: false,
		configurable: false,
		writable: true,
		value: function () {
			this.peerConnection = new RTCPeerConnection();
			this.sendOffer();
		}
	});
	
	/**
	 * Creates and offer and send it to the database
	 */
	Object.defineProperty(TestController.prototype, "sendOffer", {
		enumerable: false,
		configurable: false,
		value: async function () {
			let offerDescription = await this.peerConnection.createOffer();
			this.peerConnection.setLocalDescription(offerDescription);

			let timestamp = Date.now()*1000;
	        const ressource = "http://141.45.209.218:8001/services/people";
	        const body = JSON.stringify({"personIdentity": Controller.sessionOwner.identity,"lastTransmissionTimestamp": timestamp, "webAdress": offerDescription});
	        console.log(ressource);

	        let reponse = await fetch(ressource, {method: "POST", credentials: "include", body: body, headers: { 'Content-type': 'application/json' }});
			if(!response.ok) throw new Error(response.status + " " + response.statusText);
				
			console.log("Finish fetch post person");
		}
	});

	
	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		const anchor = document.querySelector("header li:nth-of-type(3) > a");
		const controller = new TestController();
		anchor.addEventListener("click", event => controller.display());
	});
	
} ());
