import { AuthorizationManager } from '../authorization_manager';
import { InteractiveArea } from './interactive_area';

const interactiveArea = new InteractiveArea();
const authManager = new AuthorizationManager();

if (authManager.isAuthorized()) {
    interactiveArea.hideConnectButton();
    interactiveArea.displayLogoutButton();
} else {
    interactiveArea.displayConnectButton();
    interactiveArea.hideLogoutButton();
}

const connectButton = interactiveArea.getConnectButton();

// Use a function with the "authManager" to make sure that "this" doesn't point
// to the button instead of the class.
connectButton.addEventListener('click', function() {
    try {
        authManager.authorize();

        interactiveArea.clearErrorMessage();
        interactiveArea.hideConnectButton();
        interactiveArea.displayLogoutButton();
    } catch (e: any) {
        interactiveArea.postErrorMessage(e);
    }
});

// We do the same thing with the logout button.
const logoutButton = interactiveArea.getLogoutButton();
logoutButton.addEventListener('click', function() {
    authManager.logout();

    interactiveArea.hideLogoutButton();
    interactiveArea.displayConnectButton();
});
