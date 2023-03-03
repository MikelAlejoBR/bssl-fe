import { AccessToken } from './access_token';
import { Buffer } from 'buffer';
import { identity, storage } from 'webextension-polyfill';
import { InteractiveArea } from './interactive_area';
import queryString from 'query-string';
import randomstring from 'randomstring';
import {v4 as uuidv4} from 'uuid';
import base64url from 'base64url-ts2';

export class AuthorizationManager {
    private accessToken: AccessToken | undefined;
    private authorizationCode: string | (string | null)[] | undefined;
    private codeChallenge: string | undefined;
    private readonly codeChallengeMethod: string = 'S256';
    private readonly codeChallengeLength: number = 128;
    private codeVerifier: string | undefined;
    private tokenGrantType = 'authorization_code';
    private interactiveArea: InteractiveArea;
    private readonly redirectUri: string = identity.getRedirectURL();
    private readonly responseType: string = 'code';
    private readonly spotifyClientId: string = '67a169b755b94586bc5397f18f49822b';
    private readonly spotifyAccountsUrl: string = 'https://accounts.spotify.com';
    private state: string | undefined;

    constructor(interactiveArea: InteractiveArea) {
        this.interactiveArea = interactiveArea;

        if (!this.isAuthorized()) {
            storage.local.get('authorization').then(
                auth => {
                    if (Object.keys(auth).length === 0) {
                        return;
                    }

                    this.authorizationCode = auth.authorization.code;
                    this.codeChallenge = auth.authorization.challenge;

                    this.interactiveArea.hideConnectButton();
                    this.interactiveArea.displayLogoutButton();
                }
            );
        }

        this.interactiveArea.displayConnectButton();
        this.interactiveArea.hideLogoutButton();
    }

    /**
     * Kicks off the authorization process for the user.
     */
    public authorize(): void {
        this.state = uuidv4();

        this.generateCodeVerifierChallenge().then(
            codeChallenge => {
                this.codeChallenge = codeChallenge;
    
                const pkceParams = queryString.stringify({
                    client_id: this.spotifyClientId,
                    code_challenge: this.codeChallenge,
                    code_challenge_method: this.codeChallengeMethod,
                    redirect_uri: this.redirectUri,
                    response_type: this.responseType,
                    scope: null,
                    state: this.state
                });
        
                const authorizationResponse: Promise<string> = identity.launchWebAuthFlow(
                    {
                        // Make sure that an oAuth2 authorization prompt pops up for
                        // the user.
                        interactive: true,
                        url: this.spotifyAccountsUrl + '/authorize' + '?' + pkceParams
                    }
                );
        
                // We use arrow functions here to make sure that "this" refers to the
                // class' instance.
                authorizationResponse.then(
                    (url) => this.onAuthorized(url),
                    (errorMsg) => this.onUnauthorized(errorMsg)
                );
            }
        );
    }

    /**
     * Checks if the authorization has been already one.
     * @returns true if the authorization has already been done.
     */
    private isAuthorized(): boolean {
        return this.authorizationCode != null && this.authorizationCode != undefined;
    }

    /**
     * Stores the received authorization code and the code challenge in the
     * local storage.
     * @param callbackResponseUrl the received response's URL.
     */
    private onAuthorized(callbackResponseUrl: string): void {
        const spotifyResponse = queryString.parseUrl(callbackResponseUrl);

        const authorizationCode = spotifyResponse.query.code;
        const state = spotifyResponse.query.state;

        if (authorizationCode === null) {
            this.interactiveArea.postErrorMessage('Unable to authorize to Spotify: the received authorization code is empty.');
            return;
        }

        if (state != this.state) {
            this.interactiveArea.postErrorMessage('Unable to authorize to Spotify: the received state is different to the sent one.');
            return;
        }
        
        this.authorizationCode = authorizationCode;
        storage.local.set({authorization: {code: authorizationCode, challenge: this.codeChallenge}});

        this.interactiveArea.clearErrorMessage();
        this.interactiveArea.hideConnectButton();
        this.interactiveArea.displayLogoutButton();
    }

    /**
     * Tells the user why the authorization didn't succeed.
     * @param errorMessage the error messsage to show to the user.
     */
    private onUnauthorized(errorMessage: string): void {
        this.interactiveArea.postErrorMessage(`Unable to authorize to Spotify: ${errorMessage}`);
    }

    /**
     * Generates the 'code verifier - code challenge' pair to satisfy the PKCE
     * authentication method.
     * @returns the generated code challenge. The code verifier gets set to the
     * class' member.
     */
    private async generateCodeVerifierChallenge(): Promise<string> {
        const encoder = new TextEncoder();
        const randomString = randomstring.generate({
            charset: 'aplhanumeric',
            length: this.codeChallengeLength
        });

        this.codeVerifier = randomString;

        const encodedRandomString: Uint8Array = encoder.encode(randomString);
        const hash = await crypto.subtle.digest('SHA-256', encodedRandomString);
        // Using the 'base64' encoding instead of using the Buffer directly
        // because the 'base64url' encoding isn't available when deploying the
        // extension to the browser.
        return base64url.encode(Buffer.from(hash));
    }

    /**
     * Fetches an access token from Spotify. If the token is present in the
     * local storage, and it has not expired yet, it returns the cached token.
     * @returns an access token.
     */
    public async getAccessToken(): Promise<AccessToken> {
        await storage.local.get('accessToken').then(storageObject => {
            const innerObject = storageObject.accessToken;
            // The storage always returns an object, so make sure it is empty
            // before building an access token!
            if (innerObject != undefined && Object.keys(innerObject).length != 0) {
                const accessToken = AccessToken.fromLocalStorage(innerObject);

                if (!accessToken.isTokenExpired()) {
                    this.accessToken = accessToken;

                    return accessToken;
                }
            }
        });

        // If the token is cached, use it right away!
        if (this.accessToken != undefined && !this.accessToken.isTokenExpired()) {
            return this.accessToken;
        }

        const data = {
            client_id: this.spotifyClientId,
            code: this.authorizationCode,
            code_verifier: this.codeVerifier,
            grant_type: this.tokenGrantType,
            redirect_uri: this.redirectUri
        };

        const futureResponse = fetch(
            this.spotifyAccountsUrl + '/api/token',
            {
                body: queryString.stringify(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                method: 'POST'
            }
        );

        const response = await futureResponse;
        const body = await response.text();
        const accessToken = AccessToken.fromResponseBody(body);
        this.accessToken = accessToken;

        storage.local.set({accessToken: this.accessToken});
        return this.accessToken;
    }

    /**
     * Logs the user out by clearing the local storage, which cleans the
     * authorization code, the challenge and the cached access token.
     */
    public logout(): void {
        storage.local.clear();
        this.interactiveArea.hideLogoutButton();
        this.interactiveArea.displayConnectButton();
    }
}
