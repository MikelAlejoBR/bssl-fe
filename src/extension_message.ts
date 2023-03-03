export enum InternalMessageCode {
    // Used for when the song list along with the time display are requested.
    GET,
    // Used for when the message creation process didn't have any errors.
    OK,
}

/**
 * This class is the used structure to send messages and information all over
 * the extension and the back end.
 */
export class InternalMessageResponse {
    private code: number;
    private spotifyTrackUuid: string;

    constructor(code: number, spotifyTrackUuid: string,) {
        this.code = code;
        this.spotifyTrackUuid = spotifyTrackUuid;
    }

    public getCode(): number {
        return this.code;
    }

    public getSpotifyTrackUuid(): string {
        return this.spotifyTrackUuid;
    }
}
