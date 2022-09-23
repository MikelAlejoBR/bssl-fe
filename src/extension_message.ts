export enum InternalMessageCode {
    // Used for when the song list along with the time display are requested.
    GET_ALL,
    // Used for when the message creation process didn't have any errors.
    OK,
}

/**
 * This class is the used structure to send messages and information all over
 * the extension and the back end.
 */
export class InternalMessageResponse {
    private code: number;
    private currentTime: string;
    private playlistContents: string;

    constructor(code: number, currentTime: string, playlistContents: string) {
        this.code = code;
        this.currentTime = currentTime;
        this.playlistContents = playlistContents;
    }

    public getCode(): number {
        return this.code;
    }

    public getCurrentTime(): string {
        return this.currentTime;
    }

    public getPlaylistContents(): string {
        return this.playlistContents;
    }
}
