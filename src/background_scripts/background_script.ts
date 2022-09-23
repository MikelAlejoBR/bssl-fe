import browser, { tabs } from 'webextension-polyfill';
import { InternalMessageCode } from '../extension_message';
import { WebSocketManager } from '../web_socket_manager';

// Bind the button click to the function that will send the information through
// the web socket.
browser.browserAction.onClicked.addListener(extensionButtonClickListener);

browser.runtime.onMessage.addListener(contentScriptResponseHandler);

// Create the web socket manager which we will use to keep the web socket
// connection up for sending the information over.
const wsm = new WebSocketManager();

/**
 * Sends the relevant information through the web socket.
 */
function extensionButtonClickListener(): void {
    tabs.query({url: 'https://www.bbc.co.uk/sounds/play/*'}).then(
        function (tabsResults: browser.Tabs.Tab[]){
            for (const tab of tabsResults) {
                if (tab.id !== undefined) {
                    tabs.sendMessage(tab.id, InternalMessageCode.GET_ALL);
                }
            }
        }
    );
}

/**
 * This handler simply sends all the information to the the other end of the
 * websocket.
 * @param response the sent response from the c ontent script.
 */
function contentScriptResponseHandler(response: string): void {
    wsm.sendMessage(response);
}
