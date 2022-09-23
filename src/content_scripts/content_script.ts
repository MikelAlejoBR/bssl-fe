import Browser from 'webextension-polyfill';
import { InternalMessageCode, InternalMessageResponse } from '../extension_message';

// Set the message listener for the messages coming from the background script.
Browser.runtime.onMessage.addListener(backgroundMessageListener);

/**
 * Listens to the background script's messages.
 * @param messageCode the code of the message sent by the bacgkround script.
 */
function backgroundMessageListener(messageCode: string): void {
    const internalMessageCode:number = parseInt(messageCode);

    if (internalMessageCode !== InternalMessageCode.GET_ALL) {
        console.log('ERROR: unrecognizable internal message code received: ' + internalMessageCode);
        return;
    }

    sendPlaylistAndPlayingTime();
}

/**
 * Sends the current playlist from the page and the current playing time to the
 * background script.
 */
function sendPlaylistAndPlayingTime(): void {
    // Get the player iframe to be able to scrap elements from it, as the iframe
    // eleements cannot be accessed through the "document" object directly.
    const playerIframeElement = document.getElementById('smphtml5iframesmp-wrapper');

    if (!(playerIframeElement instanceof HTMLIFrameElement)) {
        console.log('ERROR: the fetched HTML element doesn\'t seem to be the player iframe: ' + playerIframeElement);
        return;
    }

    // Grab the script tag that doesn't contain any attributes and contains the
    // text "PRELOADED".
    const iterator = document.evaluate(
        '//script[not(@*) and text()[contains(.,"PRELOADED")]]',
        document,
        null,
        XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null
    );


    // There should only be one single script with the playlist information.
    const scriptNode = iterator.iterateNext();
    if (scriptNode === null || scriptNode.textContent === null) {
        console.log('ERROR: either the script node or its contents are null');
        return;
    }

    // Grab the RAW text content.
    const scriptText = scriptNode.textContent;

    // Try to simply grab the JSON object, because the script tag usually comes
    // with more things we are not interested in.
    const regexp = new RegExp('{.+}');
    const match = regexp.exec(scriptText);

    if (match === null) {
        console.log('ERROR: unable to grab the JSON with the playlist information');
        return;
    }

    if (match.length != 1) {
        console.log('ERROR: more than one playlist JSON matched');
        return;
    }

    // At this point, we've got the playlist info ready to be sent.
    const playlistInfo = match[0];

    // Try to get the player's iframe object.
    let playerIframe = playerIframeElement.contentDocument;
    if (playerIframe === null) {
        if (playerIframeElement.contentWindow === null) {
            console.log('ERROR: unable to acces the iframe contents as they seem to be empty');
            return;
        }

        playerIframe = playerIframeElement.contentWindow.document;
    }

    // Try to grab the "current playing time" display element.
    const timeDisplay = playerIframe.getElementById('p_audioui_leftTimeDisplay');
    if (timeDisplay === null) {
        console.log('ERROR: the time display element is null');
        return;
    }

    const currentPlayingTime = timeDisplay.textContent;
    if (currentPlayingTime === null || currentPlayingTime === '') {
        console.log('ERROR: unable to ge the current playing time from the node since it is null or empty');
        return;
    }

    // Send the information to the background script.
    Browser.runtime.sendMessage(
        new InternalMessageResponse(
            InternalMessageCode.OK,
            currentPlayingTime,
            playlistInfo,
        )
    );
}
