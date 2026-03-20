import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessagesByContactId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: contactToChatId } = req.params;

    // Mark all unread messages from this contact as read
    const updateResult = await Message.updateMany(
      { senderId: contactToChatId, receiverId: myId, status: { $ne: "read" } },
      { $set: { status: "read" } }
    );

    if (updateResult.modifiedCount > 0) {
      const senderSocketId = getRecieverSocketId(contactToChatId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { readerId: myId });
      }
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: contactToChatId },
        { senderId: contactToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessagesByContactId:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Message must contain text or an image" });
    }
    if (senderId.toString() === receiverId) {
      return res
        .status(400)
        .json({ message: "Cannot send message to yourself" });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let imageUrl;
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadedResponse.secure_url;
    }

    const receiverSocketId = getRecieverSocketId(receiverId);

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      status: receiverSocketId ? "delivered" : "sent",
    });

    await newMessage.save();

    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage", newMessage)
    }


    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const myId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only the receiver can mark a message as read
    if (message.receiverId.toString() !== myId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (message.status !== "read") {
      message.status = "read";
      await message.save();

      const senderSocketId = getRecieverSocketId(message.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { readerId: myId });
      }
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in markMessageAsRead:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
