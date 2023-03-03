import Browser from 'webextension-polyfill';
import { InternalMessageCode, InternalMessageResponse } from '../extension_message';
import { MusicExtractor } from '../music_extractor';

// Set the message listener for the messages coming from the background script.
Browser.runtime.onMessage.addListener(backgroundMessageListener);

const musicExtractor = new MusicExtractor();

/**
 * Listens to the background script's messages.
 * @param messageCode the code of the message sent by the bacgkround script.
 */
function backgroundMessageListener(messageCode: string): void {
    const internalMessageCode:number = parseInt(messageCode);

    if (internalMessageCode !== InternalMessageCode.GET) {
        throw new Error(`unrecognizable internal message code received: ${internalMessageCode}`);
    }

    sendSpotifyTrackUuid();
}

/**
 * Sends the current playlist from the page and the current playing time to the
 * background script.
 */
function sendSpotifyTrackUuid(): void {
    musicExtractor.initialize();

    // Send the information to the background script.
    Browser.runtime.sendMessage(
        new InternalMessageResponse(
            InternalMessageCode.OK,
            musicExtractor.getCurrentPlayingSongUuid()
        )
    );
}
