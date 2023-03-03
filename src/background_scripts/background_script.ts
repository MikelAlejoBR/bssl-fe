import browser, { tabs } from 'webextension-polyfill';
import { InternalMessageCode, InternalMessageResponse } from '../extension_message';

// Bind the button click to the function that will send the information through
// the web socket.
browser.browserAction.onClicked.addListener(extensionButtonClickListener);

// Add a listener for the incoming messages coming from the content script.
browser.runtime.onMessage.addListener(contentScriptResponseHandler);

/**
 * Sends the relevant information through the web socket.
 */
function extensionButtonClickListener(): void {
    tabs.query({url: 'https://www.bbc.co.uk/sounds/play/*'}).then(
        function (tabsResults: browser.Tabs.Tab[]){
            for (const tab of tabsResults) {
                if (tab.id !== undefined) {
                    tabs.sendMessage(tab.id, InternalMessageCode.GET);
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
function contentScriptResponseHandler(response: InternalMessageResponse): void {
    console.log(response);
}
