import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatWebSocketSingleton } from "@/chat-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatMessageType } from "@/types";

export default function Test() {
  const {
    query: { id },
    events,
    push,
  } = useRouter();

  const [currentUser, setCurrentUser] = useState<string | null>();
  const [newMessage, setNewMessage] = useState<string>();
  const [chatHistory, setChatHistory] = useState(Array<ChatMessageType>);

  const chatManager = ChatWebSocketSingleton.getInstance();

  useEffect(() => {
    const sessionChatUserName = sessionStorage.getItem("chat_username");

    if (sessionChatUserName) {
      setCurrentUser(sessionChatUserName);
      events.on("routeChangeComplete", () => {
        chatManager
          .connect(`/chat/${id}`, setChatHistory)
          .then(() => {
            console.log("chatManager connected");
          })
          .catch((err) => {
            console.error("chatManager connection error:", err);
          });
      });

      chatManager.publish({
        channel: `/chat/${id}`,
        events: [
          JSON.stringify({
            message: `${sessionChatUserName} joined`,
            user: "system",
          }),
        ],
      });
    } else {
      push("/");
    }

    return () => {
      chatManager.disconnect();
    };
  }, [id]);
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
                  chatManager.publish({
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
