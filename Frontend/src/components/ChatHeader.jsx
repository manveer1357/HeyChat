import {useEffect} from "react";
import { useChatStore } from "../store/useChatStore";
import { X } from "lucide-react";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <div className="avatar online">
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
          <p className="text-sm text-slate-400">Online</p>
        </div>
      </div>
      <button>
        <X
          onClick={() => setSelectedUser(null)}
          className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        />
      </button>
    </div>
  );
}

export default ChatHeader;
