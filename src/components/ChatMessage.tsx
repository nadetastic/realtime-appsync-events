import { useState } from "react";

type Props = {
  chatMessage: {
    message: string;
    user: string;
  };
};

export const ChatMessage = ({ chatMessage }: Props) => {
  const [currentUser] = useState(sessionStorage.getItem("chat_username"));

  return chatMessage.user === "system" ? (
    <p className="text-center text-xs text-gray-500 pb-2">
      {chatMessage.message}
    </p>
  ) : (
    <div
      className={`${currentUser === chatMessage.user ? "text-right" : ""} my-4`}
    >
      <div
        className={`${
          currentUser === chatMessage.user
            ? "bg-blue-400 text-white"
            : "bg-gray-300"
        } p-4 rounded-md`}
      >
        {chatMessage.message}
      </div>
      <span className="px-4 text-sm text-gray-800">{chatMessage.user}</span>
    </div>
  );
};
