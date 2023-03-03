import { Track } from './playlist';

export class SpotifyTrack {
    private readonly startOffset: number;
    private readonly endOffset: number;
    private trackUuid!: string;

    constructor(rawTrack: Track) {
        this.startOffset = rawTrack.offset.start;
        this.endOffset = rawTrack.offset.end;

        const uris = rawTrack.uris;
        uris.forEach(uri => {
            if (uri.uri.indexOf('spotify') >= 0 || uri.uri.indexOf('Spotify') >= 0) {
                const regexp = new RegExp('[^/]+$');
                const match = regexp.exec(uri.uri);
                if (match == null) {
                    console.log(`unable to grab the Spotify ID from the URL ${uri}`);
                    return;
                }

                if (match.length != 1) {
                    console.log(`more than one ID found in URI ${uri}`);
                    return;
                }

                this.trackUuid = match[0];
            }
        });
    }

    /**
     * Checks if the given offset is lower than the start offset of this track.
     * @param offset the offset to check against.
     * @returns true if the given offset is lower than the start offset of this
     * track.
     */
    public isOffsetLowerThanTracksStartOffset(offset: number): boolean {
        return offset <= this.startOffset;
    }

    public isSongBeingPlayedRightNow(currentPlayingTime: number): boolean {
        return currentPlayingTime >= this.startOffset && currentPlayingTime <= this.endOffset;
    }

    public getTrackUuid(): string {
        return this.trackUuid;
    }
}
