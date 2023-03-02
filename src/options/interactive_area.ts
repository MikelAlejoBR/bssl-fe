export class InteractiveArea {
    private readonly connectButton: HTMLElement;
    private readonly errorMessageBox: HTMLElement;
    private readonly logoutButton: HTMLElement;

    constructor() {
        const connectButton = document.getElementById('connect-spotify');
        const errorMessageBox = document.getElementById('error-message-box');
        const logoutButton = document.getElementById('logout');

        if (connectButton === null) {
            throw new Error('The Spotify button is not present in the options page');
        }

        if (errorMessageBox === null) {
            throw new Error('The error message box is not persent in the options page');
        }

        if (logoutButton === null) {
            throw new Error('The log out button is not persent in the options page');
        }

        this.connectButton = connectButton;
        this.errorMessageBox = errorMessageBox;
        this.logoutButton = logoutButton;
    }

    /**
     * Displays the connect to Spotify button.
     */
    public displayConnectButton() {
        this.connectButton.style.display = '';
    }

    /**
     * Displays the logout button.
     */
    public displayLogoutButton() {
        this.logoutButton.style.display = '';
    }

    /**
     * Hides the connect to Spotify button.
     */
    public hideConnectButton() {
        this.connectButton.style.display = 'none';
    }

    /**
     * Hides the logout button.
     */
    public hideLogoutButton() {
        this.logoutButton.style.display = 'none';
    }

    /**
     * Posts an error message so that the user can read it.
     * @param errorMessage the error message to be posted.
     */
    public postErrorMessage(errorMessage: string): void {
        const pErrorMessage: HTMLElement = document.createElement('p');
        pErrorMessage.textContent = errorMessage;

        this.errorMessageBox.appendChild(pErrorMessage);
    }

    /**
     * Clears the error message box from any messages.
     */
    public clearErrorMessage(): void {
        this.errorMessageBox.replaceChildren();
    }

    public getConnectButton(): HTMLElement {
        return this.connectButton;
    }

    public getLogoutButton(): HTMLElement {
        return this.logoutButton;
    }
}
