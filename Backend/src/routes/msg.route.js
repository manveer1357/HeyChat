import express from "express";
import {
  getAllContacts,
  getMessagesByContactId,
  sendMessage,
  getChatPartners,
} from "../controllers/msg.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByContactId);
router.post("/send/:id", sendMessage);

router.post("/send", (req, res) => {
  res.send("Send message endpoint");
});

export default router;
