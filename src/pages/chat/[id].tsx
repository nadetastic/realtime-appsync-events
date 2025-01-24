import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WebSocketSingleton } from "@/chat-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessage } from "@/components/ChatMessage";

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

    webSocketManager.publish({
      channel: `/chat/${id}`,
      events: [
        JSON.stringify({
          message: `${currentUser} joined`,
          user: "system",
        }),
      ],
    });
    // Cleanup function
    return () => {
      webSocketManager.disconnect();
    };
  }, []);
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto pt-8">
        <Card>
          <CardHeader>
            <CardTitle>Chat ID: {id}</CardTitle>
          </CardHeader>
          <CardContent>
            {chatHistory &&
              chatHistory.length > 0 &&
              chatHistory.map((chatMessage, i) => {
                return <ChatMessage chatMessage={chatMessage} key={i} />;
              })}
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                onChange={(e) => setNewMessage(e.target.value)}
              />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
