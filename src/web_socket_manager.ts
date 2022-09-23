const address: string = 'ws://localhost:27745';

export class WebSocketManager {
    private socket!: WebSocket;
    private initializedSocket!: boolean;
    private messages: string[];

    constructor() {
        this.connectSocket();

        setInterval(this.isSocketStillAlive.bind(this), 5 * 1000);

        // Initialize the messages array so that we can start pushing messages
        // that could not be sent.
        this.messages = [];
    }

    /**
     * Connects the socket to the server, and binds the handler functions to
     * the functions of this class.
     */
    private connectSocket(): void {
        this.socket = new WebSocket(address);

        // Mark the socket as initialized. It might not be ready to send things
        // yet, though.
        this.initializedSocket = true;

        // Set up the handlers for the different socket events. Make sure
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onerror = this.onError.bind(this);
    }

    /**
     * After the socket gets created we need to wait before sending messages,
     * because it might not be ready yet. This function checks that.
     * @returns true if the socket is ready to send stuff.
     */
    private isSocketReady(): boolean {
        return this.socket.readyState === this.socket.OPEN;
    }

    /**
     * Checks if the socket is still alive, and if it isn't, it tries to close
     * it and recreate it.
     */
    private isSocketStillAlive(): void {
        if (this.isSocketReady()) {
            return;
        }

        this.socket.close();
        this.initializedSocket = false;

        this.connectSocket();
    }

    /**
     * Invalidates the "ready to send" state of the object when the socket
     * closes.
     * @param event the socket closing event.
     */
    private onClose(event: CloseEvent): void {
        this.initializedSocket = false;

        console.log('Websocket closed: ' + event.reason);
    }

    /**
     * Sends any messages that might have been piling up while the socket was
     * unavailable to send things.
     * @param event "the socket is ready" event.
     */
    private onOpen(event: Event): void {
        if (this.messages.length != 0) {
            for (let i = this.messages.length - 1; i >= 0; i--) {
                let message = this.messages.pop();

                if (message !== undefined) {
                    this.socket.send(message);
                }
            }
        }
    }

    /**
     * Handler for when the socket yields an error.
     * @param event the socket error event.
     */
    private onError(event: Event): void {
        console.log('WebSocket error');
    }

    /**
     * Sends a message through the web socket.
     * @param message the message to be sent.
     */
    public sendMessage(message: string): void {
        if (!this.initializedSocket || !this.isSocketReady()) {
            this.messages.push(message);
            return;
        }

        // Stringify the message to make sure that any JSON objects get sent as
        // a string and not as an [object OBJECT].
        this.socket.send(JSON.stringify(message));
    }
}
