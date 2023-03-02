import { AuthorizationManager } from './authorization_manager';
import { InteractiveArea } from './interactive_area';

const interactiveArea = new InteractiveArea();
const authManager = new AuthorizationManager(interactiveArea);

const connectButton = interactiveArea.getConnectButton();

// Use a function with the "authManager" to make sure that "this" doesn't point
// to the button instead of the class.
connectButton.addEventListener('click', function() { authManager.authorize(); });

// We do the same thing with the logout button.
const logoutButton = interactiveArea.getLogoutButton();
logoutButton.addEventListener('click', function() { authManager.logout(); });
