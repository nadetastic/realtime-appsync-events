import { Events } from "@/RealTime";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  message: string;
  user: string;
}

const c = new Events({
  endpoint: "sdkpdqrdjra3jkj7isyqfaypmu.appsync-api.us-west-2.amazonaws.com",
  apiKey: "da2-i7i3hhnigzethkebpjwmmml2li",
});

export default function Chat() {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [newMessage, setNewMessage] = useState<Message["message"]>();
  const { query } = useRouter();

  useEffect(() => {
    if (!query.id) return; // Add this check
    const connectToChat = async () => {
      try {
        await c.connect();

        await c.subscribeToChatId(query.id as string, (data: Message) => {
          // console.log(data);
          setMessages((prevMessages) => [...prevMessages, data]);
        });
      } catch (err) {
        console.log("Error connecting to ", query.id);
        console.error(err);
      }
    };
    connectToChat();

    return () => {
      c.disconnect();
    };
  }, [query.id]);

  const handlePublish = () => {
    c.publish({
      channel: "/chat/" + query.id,
      events: [
        JSON.stringify({
          message: "Hello World! Introducing AWS AppSync Events!",
        }),
      ],
    });
  };

  return (
    <div>
      <h1> CHAT ID:{JSON.stringify(query.id)}</h1>
      <pre>{JSON.stringify(messages, null, 2)}</pre>
      <Input
        placeholder="Message"
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <Button onClick={handlePublish}>Send</Button>
    </div>
  );
}
