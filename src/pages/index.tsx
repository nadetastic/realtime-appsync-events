import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/router";
import { useState } from "react";

type ChatType = "new" | "join";

export default function Home() {
  const { push } = useRouter();

  const [chatId, setChatId] = useState<string>();
  const [chatType, setChatType] = useState<ChatType>("new");

  const handleChatJoin = () => {
    push(`/chat/${chatType === "new" ? generateShortCode() : chatId}`);
    // push("test");
  };

  function generateShortCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-100 pt-8">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Start or Join a Chat</CardTitle>
          <CardDescription>
            Enter your screen name and generate a new chat or join an existing
            one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="Name">Screen Name</Label>
              <Input
                placeholder="Name"
                onChange={(e) =>
                  sessionStorage.setItem("chat_username", e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <RadioGroup
                defaultValue="new"
                onValueChange={(e) => setChatType(e as ChatType)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="r1" />
                  <Label htmlFor="r1">New</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="join" id="r2" />
                  <Label htmlFor="r2">Join</Label>
                </div>
              </RadioGroup>
            </div>
            {chatType === "join" && (
              <div className="grid gap-2">
                <Label htmlFor="password"></Label>
                <Input
                  placeholder="ChatRoomID"
                  onChange={(e) => setChatId(e.target.value)}
                />
              </div>
            )}

            <Button onClick={handleChatJoin}>Enter Chat Room</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
