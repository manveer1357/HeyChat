import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { Check, CheckCheck } from "lucide-react";

const getChatDayLabel = (dateString) => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

const isSingleEmoji = (text) => {
  if (!text) return false;
  const trimmed = text.trim();

  // 1. Break the text down into user-perceived characters (grapheme clusters)
  // This correctly counts "🧑🏾‍🦱" or "👨‍👩‍👧‍👦" as exactly 1 character.
  const segments = [...new Intl.Segmenter().segment(trimmed)];

  if (segments.length !== 1) return false;

  // 2. Check if that single character is a pictorial emoji
  const emojiRegex = /\p{Extended_Pictographic}/u;
  return emojiRegex.test(trimmed);
};

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeToMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeToMessages();
  }, [
    selectedUser._id,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeToMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  let lastProcessedDateLabel = null;

  return (
    <>
      <ChatHeader />
      <div className="flex-1 relative px-2 md:px-6 overflow-y-auto py-8">
        <div
          className="fixed inset-0 pointer-events-none -z-10"
          style={{
            backgroundImage: "url('/chat-bg.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "400px",
            opacity: 0.1, // Change this freely! Only the doodle will fade.
          }}
        />
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              // 1. Calculate the day label for this message
              const currentMessageDateLabel = getChatDayLabel(msg.createdAt);

              // 2. Check if the day has changed compared to the previous message
              const showDateIndicator =
                currentMessageDateLabel !== lastProcessedDateLabel;

              // 3. Update our tracker for the next iteration
              lastProcessedDateLabel = currentMessageDateLabel;

              const isLoneEmoji = isSingleEmoji(msg.text) && !msg.image;

              return (
                <div
                  key={msg._id}
                  className={showDateIndicator ? "space-y-6" : ""}
                >
                  {showDateIndicator && (
                    <div className="sticky top-0 z-10 flex justify-center pointer-events-none">
                      <span className="bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs px-3 py-1 rounded-lg shadow-md font-medium tracking-wide">
                        {currentMessageDateLabel}
                      </span>
                    </div>
                  )}
                  <div
                    className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                  >
                    <div
                      className={`chat-bubble relative text-sm md:text-base max-w-[75%] w-fit md:max-w-md break-words ${
                        isLoneEmoji
                          ? "bg-transparent px-0 select-none" // WhatsApp style: No bubble, massive font
                          : msg.senderId === authUser._id
                            ? "bg-cyan-600 text-white"
                            : msg.image && !msg.text
                              ? "bg-transparent px-0"
                              : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Shared"
                          className="rounded-lg max-h-48 h-fit w-fit object-contain"
                        />
                      )}
                      {msg.text && (
                        <p
                          className={
                            isLoneEmoji
                              ? "text-right text-5xl"
                              : msg.senderId === authUser._id
                                ? "text-end align-text-bottom"
                                : "text-start align-text-bottom"
                          }
                        >
                          {msg.text}
                        </p>
                      )}
                    </div>
                    <p className="chat-footer text-xs mt-1 opacity-75 flex items-center justify-end gap-1">
                      {new Date(msg.createdAt).toISOString().slice(11, 16)}
                      {msg.senderId === authUser._id && (
                        <span className="ml-1">
                          {msg.status === "read" ? (
                            <CheckCheck className="w-4 h-4 text-blue-500" />
                          ) : msg.status === "delivered" ? (
                            <CheckCheck className="w-4 h-4 text-slate-400" />
                          ) : (
                            <Check className="w-4 h-4 text-slate-400" />
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>
      <MessageInput />
    </>
  );
}

export default ChatContainer;
