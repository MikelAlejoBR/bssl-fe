import browser from "webextension-polyfill";
import { WebSocketManager } from "./web_socket_manager";

// Bind the button click to the function that will send the information through
// the web socket.
browser.browserAction.onClicked.addListener(extensionButtonClickListener);

// Create the web socket manager which we will use to keep the web socket
// connection up for sending the information over.
const wsm = new WebSocketManager();

/**
 * Sends the relevant information through the web socket.
 */
function extensionButtonClickListener() {
    wsm.sendMessage('Hello, World!');
}
