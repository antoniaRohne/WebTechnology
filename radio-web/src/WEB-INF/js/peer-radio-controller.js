"use strict";

(function () {
	// imports
	const Controller = de_sb_radio.Controller;

	const signaling = new SignalingChannel(); // handles JSON.stringify/parse
	const constraints = {audio: true, video: true};
	const configuration = {iceServers: [{urls: 'stuns:stun.example.org'}]};
	
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
			
			localConnection = new RTCPeerConnection(configurations);

			sendChannel = localConnection.createDataChannel("sendChannel");
			sendChannel.addEventListener('open', onSendChannelOpen);
			sendChannel.addEventListener('close', onSendChannelClosed);
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
			        mainElement.querySelector("ul").childNodes[nextId].classList.add("selected");
			        
			        var remote = context.createMediaStreamDestination();
			 
			        source.connect(remote);
			 
			        localConnection.addStream(remote.stream);
			 
			        localConnection.createOffer(handleLocalDescription);
			    });
			});
			 
			      reader.readAsArrayBuffer(files[nextId]);
	
			/*if(mainElement.querySelector("#player") == null){
			let audioPlayer = document.createElement("AUDIO");
			audioPlayer.id = "player";
			audioPlayer.setAttribute("src",URL.createObjectURL(files[nextId]));
			mainElement.querySelector("ul").childNodes[nextId].classList.add("selected");
			audioPlayer.addEventListener("ended", this.playNext);
			mainElement.appendChild(audioPlayer);
			audioPlayer.play();
			}*/
		}
	});
	
	// send any ice candidates to the other peer
	localConnection.onicecandidate = ({candidate}) => signaling.send({candidate});

	// let the "negotiationneeded" event trigger offer generation
	localConnection.onnegotiationneeded = async () => {
	  try {
	    await localConnection.setLocalDescription(await localConnection.createOffer());
	    // send the offer to the other peer
	    signaling.send({desc: localConnection.localDescription});
	  } catch (err) {
	    console.error(err);
	  }
	};

	// once media for a remote track arrives, show it in the remote video element
	localConnection.ontrack = (event) => {
		console.log("on track");
	}
	
	signaling.onmessage = async ({desc, candidate}) => {
		  try {
		    if (desc) {
		      // if we get an offer, we need to reply with an answer
		      if (desc.type == 'offer') {
		        await localConnection.setRemoteDescription(desc);
		        await localConnection.setLocalDescription(await localConnection.createAnswer());
		        signaling.send({desc: localConnection.localDescription});
		      } else if (desc.type == 'answer') {
		        await localConnection.setRemoteDescription(desc);
		      } else {
		        console.log('Unsupported SDP type. Your code may differ here.');
		      }
		    } else if (candidate) {
		      await localConnection.addIceCandidate(candidate);
		    }
		  } catch (err) {
		    console.error(err);
		  }
		};
	
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
			remoteConnection = new RTCPeerConnection();
			remoteConnection.addEventListener('icecandidate', e => onIceCandidate(remoteConnection, e));
			remoteConnection.addEventListener('track', gotRemoteStream);
		}
	});	
	
	function onSendChannelOpen() {
		  console.log('Send channel is open');
		  sendData();
	}

	function onSendChannelClosed() {
		  console.log('Send channel is closed');
		  localConnection.close();
		  localConnection = null;
		  console.log('Closed local peer connection');
	}
	
	function receiveChannelCallback(event){
		receiveChannel = event.channel;
		receiveChannel.onmessage(handleReceiveMessage);
		receiveChannel.onopen = handleReceiveChannelStatusChange;
		receiveChannel.onclose = handleReceiveChannelStatusChange;
	}
	
	async function onIceCandidate(pc, event) {
		  const candidate = event.candidate;
		  if (candidate === null) {
		    return;
		  } // Ignore null candidates
		  try {
		    await getOtherPc(pc).addIceCandidate(candidate);
		    console.log('AddIceCandidate successful: ', candidate);
		  } catch (e) {
		    console.error('Failed to add Ice Candidate: ', e);
		  }
	}
	
	function getOtherPc(pc) {
		  return (pc === localConnection) ? remoteConnection : localConnection;
	}
	
	function receiveChannelCallback(event) {
		  console.log('Receive Channel Callback');
		  receiveChannel = event.channel;
		  receiveChannel.binaryType = 'arraybuffer';
		  receiveChannel.addEventListener('close', onReceiveChannelClosed);
	}
	
	async function handleLocalDescription(desc) {
		  localConnection.setLocalDescription(desc);
		  console.log('Offer from localConnection:\n', desc.sdp);
		  remoteConnection.setRemoteDescription(desc);
		  try {
		    const remoteAnswer = await remoteConnection.createAnswer();
		    handleRemoteAnswer(remoteAnswer);
		  } catch (e) {
		    console.error('Error when creating remote answer: ', e);
		  }
	}
	
	function handleRemoteAnswer(desc) {
		  remoteConnection.setLocalDescription(desc);
		  console.log('Answer from remoteConnection:\n', desc.sdp);
		  localConnection.setRemoteDescription(desc);
	}
	
	function sendData() {
		  // Stop scheduled timer if any (part of the workaround introduced below)
		  if (timeoutHandle !== null) {
		    clearTimeout(timeoutHandle);
		    timeoutHandle = null;
		  }

		  while (sendProgress.value < sendProgress.max) {
			console.log('Sending data...');
		    sendChannel.send("HI");
		    bufferedAmount += chunkSize;
		    sendProgress.value += chunkSize;
		    console.log(`Sent ${sendProgress.value}/${sendProgress.max}`);

		    // Pause sending if we reach the high water mark
		    if (bufferedAmount >= highWaterMark) {
		      // This is a workaround due to the bug that all browsers are incorrectly calculating the
		      // amount of buffered data. Therefore, the 'bufferedamountlow' event would not fire.
		      if (sendChannel.bufferedAmount < lowWaterMark) {
		        timeoutHandle = setTimeout(() => sendData(), 0);
		      }
		      console.log(`Paused sending, buffered amount: ${bufferedAmount} (announced: ${sendChannel.bufferedAmount})`);
		      break;
		    }
		  }
	}
	
	function onReceiveChannelClosed() {
		  console.log('Receive channel is closed');
		  remoteConnection.close();
		  remoteConnection = null;
		  console.log('Closed remote peer connection');  
	}
	
	function gotRemoteStream(event) {
		  // create a player, we could also get a reference from a existing player in the DOM
		  var player = new Audio();
		  // attach the media stream
		  attachMediaStream(player, event.stream);
		  // start playing
		  player.play();
		}
	
	/**
	 * Perform controller callback registration during DOM load event handling.
	 */
	window.addEventListener("load", event => {
		const anchor = document.querySelector("header li:nth-of-type(3) > a");
		const controller = new PeerRadioController();
		anchor.addEventListener("click", event => controller.display());
	});
	
} ());
