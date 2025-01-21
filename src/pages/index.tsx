import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
    push(`/chat/${chatType === "new" ? "new_1234" : chatId}`);
  };
  return (
    <div className="flex justify-center">
      <Card className="">
        <CardHeader></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="Name">Name</Label>
              <Input placeholder="Name" />
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
        <CardFooter>{chatId}</CardFooter>
      </Card>
    </div>
  );
}
