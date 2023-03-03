import { Playlist, Track, Tracklist } from './playlist';
import { SpotifyTrack } from './spotify_track';

export class MusicExtractor {
    // The time display property is definitely not null or undefined, since we
    // check for that before assigning it.
    private timeDisplay!: HTMLElement;
    private readonly trackList: SpotifyTrack[] = [];

    public initialize(): void {
        if (this.timeDisplay != null || this.timeDisplay != undefined) {
            return;
        }

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
            throw new Error('unable to locate the script node containing the playlist');
        }

        // Grab the RAW text content.
        const scriptText = scriptNode.textContent;

        // Try to simply grab the JSON object, because the script tag usually comes
        // with more things we are not interested in.
        const regexp = new RegExp('{.+}');
        const match = regexp.exec(scriptText);

        if (match === null) {
            throw new Error('unable to locate the JSON with the playlist\'s information');
        }

        if (match.length != 1) {
            throw new Error('more than one playlist was located in the page');
        }

        // At this point, we've got the playlist information.
        const playlistInfo: Playlist = JSON.parse(match[0]);
        const trackListObject: Tracklist = playlistInfo.tracklist;
        const tracks: Track[] = trackListObject.tracks;
        tracks.forEach(track => {
            this.trackList.push(new SpotifyTrack(track));
        });

        // Try to get the player's iframe object.
        let playerIframe = playerIframeElement.contentDocument;
        if (playerIframe === null) {
            if (playerIframeElement.contentWindow === null) {
                throw new Error('ERROR: unable to acces the iframe contents as they seem to be empty');
            }

            playerIframe = playerIframeElement.contentWindow.document;
        }

        // Try to grab the "current playing time" display element.
        const timeDisplay = playerIframe.getElementById('p_audioui_leftTimeDisplay');
        if (timeDisplay === null || timeDisplay === undefined) {
            throw new Error('unable to locate the track\'s time display element in the page');
        }

        this.timeDisplay = timeDisplay;
    }

    /**
     * Gets the song's UUID from the current playing track.
     */
    public getCurrentPlayingSongUuid(): string {
        const currentPlayingTime = this.getCurrentPlayingTime();

        let startOffsetTooBigCount = 0;
        for (const track of this.trackList) {
            if (startOffsetTooBigCount > 2) {
                break;
            }

            if (track.isOffsetLowerThanTracksStartOffset(currentPlayingTime)) {
                startOffsetTooBigCount++;
            }

            if (track.isSongBeingPlayedRightNow(currentPlayingTime)) {
                return track.getTrackUuid();
            }
        }

        throw new Error('unable to find the current playing track');
    }

    /**
     * Gets the current playing time from the music player.
     * @returns the offset of the current playing time.
     */
    private getCurrentPlayingTime(): number {
        const currentPlayingTime = this.timeDisplay.textContent;
        if (currentPlayingTime === null || currentPlayingTime === '') {
            throw new Error('ERROR: unable to get the current playing time from the node since it is null or empty');
        }

        const time: string[] = currentPlayingTime.split(':');

        let hours: number;
        let minutes: number;
        let seconds: number;

        if (time.length === 2) {
            hours = 0;
            minutes = parseInt(time[0]);
            seconds = parseInt(time[1]);
        } else if (time.length === 3) {
            hours = parseInt(time[0]);
            minutes = parseInt(time[1]);
            seconds = parseInt(time[2]);
        } else {
            throw new Error(`the current playing time is in an unexpected format: ${currentPlayingTime}`);
        }

        return (hours * 3600) + (minutes * 60) + seconds;
    }
}
