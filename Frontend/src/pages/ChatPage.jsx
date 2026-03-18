import React from "react";
import { useAuthStore } from "../store/useAuthStore";

const ChatPage = () => {
  const { logout } = useAuthStore();
  return (
    <div className="z-10">
      <button className="btn btn-primary" onClick={logout}>
        Logout
      </button>
      ChatPage
    </div>
  );
};

export default ChatPage;
