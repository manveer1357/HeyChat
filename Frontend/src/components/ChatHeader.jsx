import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="sticky top-0 z-10 px-6 md:py-4 py-2 flex justify-between items-center max-h-[84px] row-start-1 col-start-1 self-start">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none backdrop-blur-[40px] bg-gradient-to-t from-transparent to-slate-900/80"
        style={{
          maskImage: "linear-gradient(to top, transparent, black)",
          WebkitMaskImage: "linear-gradient(to top, transparent, black)",
        }}
      />
      <div className="relative z-10 flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt="User avatar"
            />
          </div>
        </div>
        <div>
          <h3 className="text-slate-200 font-medium">
            {selectedUser.fullName}
          </h3>
          <p className="text-sm text-slate-400">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <button className="relative z-10 p-2 backdrop-blur-md border-2 border-slate-800 rounded-full">
        <X
          onClick={() => setSelectedUser(null)}
          className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        />
      </button>
    </div>
  );
}

export default ChatHeader;
