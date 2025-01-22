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

  const [currentUser] = useState(sessionStorage.getItem("chat_username"));
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
    <div className="container mx-auto">
      <h1 className="text-center">
        Chat Room #<pre>{id}</pre>
      </h1>
      <p className="text-right">Hi, {currentUser}</p>

      {chatHistory &&
        chatHistory.length > 0 &&
        chatHistory.map((chatMessage, i) => {
          return (
            <div
              className={`${
                currentUser === chatMessage.user ? "text-right" : ""
              } my-4`}
              key={i}
            >
              <div
                className={`${
                  currentUser === chatMessage.user
                    ? "bg-blue-400 text-white"
                    : "bg-gray-300"
                } p-4`}
              >
                {chatMessage.message}
              </div>
              <span className="px-4 text-sm text-gray-800">
                {chatMessage.user}
              </span>
            </div>
          );
        })}
      <Input onChange={(e) => setNewMessage(e.target.value)} />
      <Button
        onClick={() =>
          webSocketManager.publish({
            channel: `/chat/${id}`,
            events: [
              JSON.stringify({
                message: newMessage,
                user: currentUser,
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
