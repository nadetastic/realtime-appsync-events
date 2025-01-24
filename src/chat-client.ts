import { Dispatch, SetStateAction } from "react";
import type { AppSyncEventType, ChatMessageType } from "./types";

import config from "@/config.json";

export class ChatWebSocketSingleton {
  private static instance: ChatWebSocketSingleton | null = null;
  private socket: WebSocket | null = null;
  private readonly REALTIME_DOMAIN: string;
  private readonly authorization: { [key: string]: string };

  private constructor() {
    const HOST = config.appsyncEndpoint;
    this.REALTIME_DOMAIN = `wss://${HOST.split("-api")[0]}-realtime-api${
      HOST.split("-api")[1]
    }/event/realtime`;
    this.authorization = {
      "x-api-key": "da2-i7i3hhnigzethkebpjwmmml2li",
      host: HOST,
    };
  }

  public static getInstance(): ChatWebSocketSingleton {
    if (!ChatWebSocketSingleton.instance) {
      ChatWebSocketSingleton.instance = new ChatWebSocketSingleton();
    }
    return ChatWebSocketSingleton.instance;
  }

  public connect(
    channel: string,
    handler: Dispatch<SetStateAction<Array<ChatMessageType>>>
  ): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve(this.socket);
        return;
      }

      this.socket = new WebSocket(this.REALTIME_DOMAIN, [
        "aws-appsync-event-ws",
        this.getAuthProtocol(),
      ]);

      this.socket.onopen = () => {
        console.log("WebSocket connection opened");
        this.socket!.send(JSON.stringify({ type: "connection_init" }));
      };

      this.socket.onclose = () => {
        console.log("WebSocket connection closed");
        this.socket = null;
      };

      this.socket.onmessage = (evt) => {
        const data = JSON.parse(evt.data);
        this.handleMessage(data, channel, handler);
      };

      this.socket.onerror = (err) => {
        console.error("WebSocket error");
        reject(err);
      };

      resolve(this.socket);
    });
  }

  private handleMessage(
    data: AppSyncEventType,
    channel: string,
    handler: Dispatch<SetStateAction<Array<ChatMessageType>>>
  ) {
    switch (data.type) {
      case "ka":
        console.log("KeepAlive");
        break;
      case "connection_ack":
        this.socket!.send(
          JSON.stringify({
            type: "subscribe",
            id: crypto.randomUUID(),
            channel,
            authorization: this.authorization,
          })
        );
        console.log("Subscribe request to", channel);
        break;
      case "subscribe_success":
        console.log("Subscription successful");
        break;
      case "data":
        handler((prev) => [...prev, JSON.parse(data.event)]);
        break;
      default:
        break;
    }
  }

  private getAuthProtocol(): string {
    const header = btoa(JSON.stringify(this.authorization))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return `header-${header}`;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log("WebSocket disconnected");
    }
  }

  public async publish(event: object): Promise<void> {
    const HTTP_DOMAIN = `https://${this.authorization.host}/event`;
    try {
      await fetch(HTTP_DOMAIN, {
        method: "POST",
        headers: this.authorization,
        body: JSON.stringify(event),
      });
    } catch (err) {
      console.error("Publish error:", err);
    }
  }
}
