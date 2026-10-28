import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { Camera, ImageIcon, SendIcon, XIcon } from "lucide-react";

function MessageInput() {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { sendMessage } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });
    setText("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative w-full row-start-1 col-start-1 self-end px-4 py-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none backdrop-blur-[40px] bg-gradient-to-b from-transparent to-slate-900/80"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black)",
        }}
      />
      <div className="relative z-10">
        {imagePreview && (
          <div className="max-w-3xl mx-auto mb-3 flex items-center">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-slate-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto flex gap-2 md:gap-4 items-center"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`backdrop-blur-md border-2 border-slate-800 rounded-full text-slate-400 flex items-center justify-center hover:text-slate-200 p-4 md:p-2.5 transition-colors ${
              imagePreview ? "text-cyan-500" : ""
            }`}
          >
            <Camera className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            className="relative z-0 flex-1 min-w-0 bg-transparent backdrop-blur-md border-2 border-slate-800 rounded-full py-4 md:py-2 px-4 transition-all ease-in-out duration-300 text-sm md:text-base text-white outline-none focus:z-10 focus:scale-x-[1.03] focus:border-cyan-400/60 focus:bg-slate-900/30 focus:ring-4 focus:ring-cyan-400/10"
            placeholder="Type your message..."
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="flex items-center justify-center backdrop-blur-md border-2 border-slate-800 rounded-full p-4 md:p-2.5 font-medium text-cyan-500 disabled:text-gray-500 transition-all ease-in-out duration-500 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default MessageInput;
