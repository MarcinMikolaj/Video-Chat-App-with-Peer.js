let connectButton;
let usernameInput;
let connectionPeerIdInput;

const prepareDOMElements = () => {
	// Inputs
	usernameInput = document.querySelector('.usernameInput');
	connectionPeerIdInput = document.querySelector('.connectionPeerIdInput');
	// Buttons
	connectButton = document.querySelector('.connect_button');
};

const prepareDOMEvents = () => {
	connectButton.addEventListener('click', connect);
};

const main = () => {
	prepareDOMElements();
	prepareDOMEvents();
	clear();
};

const clear = () => {
	usernameInput.value = '';
	connectionPeerIdInput.value = '';
};

const connect = () => {
	console.log('Connect action');
	console.log(`username: ${usernameInput.value}`);
	console.log(`Connect with peer id: ${connectionPeerIdInput.value}`);
};

document.addEventListener('DOMContentLoaded', main);
