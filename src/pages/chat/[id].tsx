import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WebSocketSingleton } from "@/chat-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Test() {
  const {
    query: { id },
    events,
  } = useRouter();

  const [newMessage, setNewMessage] = useState<string>();
  const [chatHistory, setChatHistory] = useState([]);

  const webSocketManager = WebSocketSingleton.getInstance();

  useEffect(() => {
    events.on("routeChangeComplete", () => {
      webSocketManager
        .connect(`/chat/${id}`, setChatHistory)
        .then(() => {
          console.log("WebSocket connected");
        })
        .catch((error) => {
          console.error("Connection error:", error);
        });
    });

    // Cleanup function
    return () => {
      webSocketManager.disconnect();
    };
  }, []);
  return (
    <div>
      <h1>Test</h1>
      {/* <p>Hi, {sessionStorage.getItem("chat_username")}</p> */}
      <pre>{JSON.stringify(chatHistory, null, 2)}</pre>
      <Input onChange={(e) => setNewMessage(e.target.value)} />
      <Button
        onClick={() =>
          webSocketManager.publish({
            channel: `/chat/${id}`,
            events: [
              JSON.stringify({
                message: newMessage,
                user: sessionStorage.getItem("chat_username"),
              }),
            ],
          })
        }
      >
        Send
      </Button>
    </div>
  );
}
