// Inputs
let usernameInput;
let destinationPeerIdInput;
let enterMessageInput;

// Buttons
let connectButton;
let endCallButton;
let sendMessageButton;

// Video
let localVideo;
let remoteVideo;

// Wrappers
let videoChatWrapper;
let joinWrapper;

// Variable
let username;
let destinationPeerId;

const peer = new Peer();
let currentStream;
let currentCall;
let currentDataConnection;

// Other
let assignedPeerId;

const prepareDOMElements = () => {
	// Inputs
	usernameInput = document.querySelector('.usernameInput');
	destinationPeerIdInput = document.querySelector('.destinationPeerIdInput');
	enterMessageInput = document.querySelector('.enter_message_input');

	// Buttons
	connectButton = document.querySelector('.connect_button');
	endCallButton = document.querySelector('.end_call_button');
	sendMessageButton = document.querySelector('.send_message_button');

	// Video
	localVideo = document.querySelector('.local_video');
	remoteVideo = document.querySelector('.remote_video');

	// Wrappers
	videoChatWrapper = document.querySelector('.video_chat_wrapper');
	joinWrapper = document.querySelector('.join_wrapper');

	// Other
	assignedPeerId = document.querySelector('.assigned_peer_id');
};

const prepareDOMEvents = () => {
	connectButton.addEventListener('click', connect);
	endCallButton.addEventListener('click', disconnect);
	sendMessageButton.addEventListener('click', sendMessage);
	enterMessageInput.addEventListener('keypress', sendMessageE);
};

const main = () => {
	prepareDOMElements();
	prepareDOMEvents();
	clear();
};

const clear = () => {
	usernameInput.value = '';
	destinationPeerIdInput.value = '';
};

async function connect() {
	username = usernameInput.value;
	destinationPeerId = destinationPeerIdInput.value;

	console.log(`username: ${username}`);
	console.log(`Connect with peer id: ${destinationPeerId}`);

	// Start data connection (exchange of messages)
	currentDataConnection = peer.connect(destinationPeerId);

	currentDataConnection.on('data', (data) => {
		console.log(`Receive message: ${data}`);
	});

	joinWrapper.style.display = 'none';
	videoChatWrapper.style.display = 'flex';

	const stream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: true,
	});

	currentStream = stream;

	localVideo.srcObject = stream;
	localVideo.play();

	// Start call
	const call = peer.call(destinationPeerId, stream);
	currentCall = call;

	call.on('stream', (stream) => {
		remoteVideo.srcObject = stream;
		remoteVideo.play();
	});
	call.on('error', (err) => console.log(err));
	call.on('close', () => disconnect);
}

const disconnect = () => {
	currentStream.getTracks().forEach(function (track) {
		track.stop();
	});

	if (!currentCall) {
		return;
	}

	try {
		currentCall.close();
	} catch {}
	{
		currentCall = undefined;
	}

	joinWrapper.style.display = 'flex';
	videoChatWrapper.style.display = 'none';
};

// Emited when a connection to the PeerServer is established.
peer.on('open', (id) => {
	assignedPeerId.textContent = id;
	localVideo.srcObject = null;
});

// Response on call from remote peer
peer.on('call', (call) => {
	if (confirm(`Accept call from ${call.peer}`)) {
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true,
			})
			.then((stream) => {
				localVideo.srcObject = stream;
				localVideo.play();

				currentStream = stream;
				currentCall = call;

				call.answer(stream);

				joinWrapper.style.display = 'none';
				videoChatWrapper.style.display = 'flex';

				call.on('stream', (stream) => {
					remoteVideo.srcObject = stream;
					remoteVideo.play();
				});
			})
			.catch((err) => console.log(err));
	} else {
		console.log('Call rejected');
	}
});

// Response on data from remote peer
peer.on('connection', (connection) => {
	currentDataConnection = connection;

	currentDataConnection.on('data', (data) => {
		console.log(`Receive message: ${data}`);
	});
});

const sendMessage = () => {
	const message = enterMessageInput.value;

	currentDataConnection.send(message);

	showMessageInInterface(message);
	enterMessageInput.value = '';
};

const sendMessageE = (e) => {
	if (e.key === 'Enter') {
		sendMessage();
	}
	return;
};

// **
// Functions: add to view
// **

const showMessageInInterface = (message) => {
	if (!message) {
		return;
	}

	const li = document.createElement('li');
	li.textContent = message;
	document.querySelector('.chat_wrapper__section_messages').appendChild(li);
};

document.addEventListener('DOMContentLoaded', main);
