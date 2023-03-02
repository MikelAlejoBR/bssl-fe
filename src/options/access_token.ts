import moment from 'moment';

export class AccessToken {
    private readonly access_token: string;
    private readonly token_type: string;
    private readonly scope: string;
    private readonly expires_in: number;
    // The timestamp is stored as a number because when using a moment object,
    // the browser's storage API throws a "DataCloneError: The object could not
    // be cloned" error.
    private readonly sophisticatedExpires: number;
    private readonly refresh_token: string;

    private constructor(access_token: string, token_type: string, scope: string, expires_in: number, refresh_token: string) {
        this.access_token = access_token;
        this.token_type = token_type;
        this.scope = scope;
        this.expires_in = expires_in;
        this.refresh_token = refresh_token;

        const now = moment();
        this.sophisticatedExpires = now.add(this.expires_in, 'seconds').unix();
    }

    /**
     * Builds an access token from the retrieved object from the storage.
     * @param record the retrieved object from the storage.
     * @returns a new AccessToken.
     */
    // The 'no-explicit-any' rule is disabled here because we are going to
    // receive a mixture of strings and numbers.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromLocalStorage(record: Record<string, any>) {
        return new this(
            record.access_token,
            record.token_type,
            record.scope,
            record.expires_in,
            record.refresh_token
        );
    }

    /**
     * Builds a new access token from the response body that Spotify returns.
     * @param responseBody the received response body.
     * @returns a new AccessToken.
     */
    static fromResponseBody(responseBody: string): AccessToken {
        const jsonObject = JSON.parse(responseBody);

        return new this(
            jsonObject.access_token,
            jsonObject.token_type,
            jsonObject.scope,
            jsonObject.expires_in,
            jsonObject.refresh_token
        );
    }

    public getAccessToken(): string {
        return this.access_token;
    }

    public getTokenType(): string {
        return this.token_type;
    }

    public getScope(): string {
        return this.scope;
    }

    public getExpiresIn(): number {
        return this.expires_in;
    }

    public getRefreshToken(): string {
        return this.refresh_token;
    }

    /**
     * Checks if the token has already expired.
     * @returns ture if it has expired.
     */
    public isTokenExpired(): boolean {
        // We leave the function call empty, because in that case the library
        // defaults it to "now". If the date is in the future, "isBefore" will
        // return false and therefore signal that the token "has not yet
        // expired".
        return moment.unix(this.sophisticatedExpires).isBefore();
    }
}
