import { useState, useEffect, useRef } from "react";
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

  const [selectedReply, setSelectedReply] = useState(null);

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

  const messageGroups = messages.reduce((groups, msg) => {
    const label = getChatDayLabel(msg.createdAt);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.label === label) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({ label, messages: [msg] });
    }

    console.log(groups);
    return groups;
  }, []);

  return (
    <section className="relative w-full min-h-full grid grid-rows-1 overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: "url('/chat-bg.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "400px",
          opacity: 0.09, // Change this freely! Only the doodle will fade.
        }}
      />
      <ChatHeader />
      <div className="row-start-1 col-start-1 px-2 md:px-6 w-full overflow-y-auto py-16">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="relative max-w-3xl mx-auto space-y-6">
            {messageGroups.map((group) => {
              return (
                <div
                  key={`${group.label}-${group.messages[0]._id}`}
                  className="space-y-6"
                >
                  <div className="sticky top-5 z-10 flex justify-center pointer-events-none">
                    <span className="bg-slate-900 text-slate-300 text-xs px-3 py-1 rounded-lg shadow-md font-medium tracking-wide">
                      {group.label}
                    </span>
                  </div>
                  {group.messages.map((msg) => {
                    const isLoneEmoji = isSingleEmoji(msg.text) && !msg.image;

                    return (
                      <div
                        key={msg._id}
                        className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                      >
                        <div className="chat-image avatar">
                          <div className="w-10 rounded-full">
                            {msg.senderId === authUser._id ? (
                              <img
                                alt="Profile"
                                src={authUser.profilePic || "/avatar.png"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                alt="Profile"
                                src={selectedUser.profilePic || "/avatar.png"}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>

                        <div
                          className={`chat-bubble relative text-sm md:text-base max-w-[75%] w-fit md:max-w-md break-words ${
                            isLoneEmoji
                              ? "bg-transparent px-0 select-none"
                              : msg.senderId === authUser._id
                                ? "bg-cyan-950 text-white"
                                : msg.image && !msg.text
                                  ? "bg-transparent px-0"
                                  : "bg-slate-800 text-slate-200"
                          }`}
                          tabIndex={0}
                        >
                          <div
                            className={`dropdown-close dropdown dropdown-hover ${msg.senderId === authUser._id ? "dropdown-left" : "dropdown-right"}`}
                          >
                            <ul
                              tabIndex={-1}
                              className="dropdown-content menu bg-base-100 rounded-box z-1 w-[1/2] p-2 shadow-sm"
                            >
                              <li>
                                <button onClick={() => setSelectedReply(msg)}>
                                  Reply
                                </button>
                              </li>
                            </ul>
                            {msg.replyTo && (
                              <div
                                className={`p-2 mt-2 flex flex-col rounded-md gap-1 relative text-sm md:text-base break-words ${
                                  msg.senderId === authUser._id
                                    ? "bg-cyan-900 text-cyan-400 border-cyan-400 border-l-4 "
                                    : "bg-slate-800 text-cyan-400 border-slate-400 border-l-4 "
                                } text-slate-200`}
                              >
                                <span
                                  className={`font-semibold text-xs ${
                                    msg.senderId === authUser._id
                                      ? "text-cyan-400 "
                                      : "text-slate-400"
                                  }`}
                                >
                                  {msg.replyTo.senderId === authUser._id
                                    ? "You"
                                    : selectedUser.fullName}
                                </span>

                                {msg.replyTo.image && (
                                  <img
                                    src={msg.replyTo.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg border border-slate-700"
                                  />
                                )}
                                {msg.replyTo.text}
                              </div>
                            )}
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="Shared"
                                className="rounded-lg max-h-48 h-fit w-fit object-contain"
                                tabIndex={0}
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
                                tabIndex={0}
                              >
                                {msg.text}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="chat-footer text-xs mt-1 opacity-75 flex items-center justify-end gap-1">
                          {new Date(msg.createdAt)
                            .toLocaleString("en-IN", {
                              timezone: "Asia/Kolkata",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            .toUpperCase()}
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
                    );
                  })}
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
      <MessageInput
        replyToMessage={selectedReply}
        onCancelReply={() => setSelectedReply(null)}
      />
    </section>
  );
}

export default ChatContainer;
