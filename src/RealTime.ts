// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageHandler = (data: any) => void;

export class Events {
  private REALTIME_DOMAIN = "";
  private HTTP_DOMAIN = "";
  private authorization = { "x-api-key": "", host: "" };
  private socket: WebSocket | null;
  private connectionPromise: Promise<void> | null;
  private resolveConnection: (() => void) | null;
  private messageHandlers: Map<string, MessageHandler>;

  constructor({ endpoint, apiKey }: { endpoint: string; apiKey: string }) {
    this.HTTP_DOMAIN = `https://${endpoint}/event`;
    this.REALTIME_DOMAIN = `wss://${endpoint.split("-api")[0]}-realtime-api${
      endpoint.split("-api")[1]
    }/event/realtime`;
    this.socket = null;
    this.authorization = { "x-api-key": apiKey, host: endpoint };
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.resolveConnection = null;
  }

  public connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    this.connectionPromise = new Promise((resolve, reject) => {
      this.resolveConnection = resolve;

      this.socket = new WebSocket(this.REALTIME_DOMAIN, [
        "aws-appsync-event-ws",
        this.getAuthProtocol(),
      ]);

      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
        this.socket?.close();
      }, 10000); // 10 second timeout

      this.socket.onopen = () => {
        clearTimeout(timeout);
        this.socket?.send(JSON.stringify({ type: "connection_init" }));
        resolve();
      };
      this.socket.onmessage = (e) => {
        console.log("NEW MSG:");
        const data = JSON.parse(e.data);

        console.log({ data });
        switch (data.type) {
          case "ka":
            console.log("KeepAlive");
            break;
          case "subscribe_success":
            console.log("Success Subscribe");
          case "data":
            console.log(data.event);
            for (const [key, handler] of this.messageHandlers) {
              console.log("key", key, "-", data.id);
              if (key === data.id) {
                const event = data && data.event ? JSON.parse(data.event) : "";
                handler(event);
              }
              // if (data.id[key]) {
              //   handler(data.payload.data[key]);
              // }
            }
          default:
            break;
        }
      };
      this.socket.onerror = (e) => {
        console.log("NEW ERR:", e);
        reject(new Error("WebSocket error"));
      };
      this.socket.onclose = (e) => {
        console.error(e);
        this.connectionPromise = null; // Reset for potential reconnection
        reject(new Error(e.reason || "WebSocket closed"));
      };
    });

    return this.connectionPromise;
  }

  private getAuthProtocol() {
    console.log(this.authorization);
    const header = btoa(JSON.stringify(this.authorization))
      .replace(/\+/g, "-") // Convert '+' to '-'
      .replace(/\//g, "_") // Convert '/' to '_'
      .replace(/=+$/, ""); // Remove padding `=`

    console.log(header);
    return `header-${header}`;
  }

  public async subscribeToChatId(chatId: string, handler: MessageHandler) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const id = chatId + "_" + crypto.randomUUID();
      console.log("subscribing to", chatId);

      this.messageHandlers.set(id, handler);

      this.socket.send(
        JSON.stringify({
          type: "subscribe",
          id,
          channel: `/chat/${chatId}`,
          authorization: this.authorization,
        })
      );
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      console.log("Socket closed");
    }
    console.log("Disconnected");
  }

  public async publish(event: object) {
    try {
      const response = await fetch(this.HTTP_DOMAIN, {
        method: "POST",
        headers: this.authorization,
        body: JSON.stringify(event),
      });
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  }
}
