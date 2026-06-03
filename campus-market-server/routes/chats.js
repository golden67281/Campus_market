import express from 'express';
import { readTable, writeTable, generateId } from '../utils/db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { normalizeProduct, normalizeUser } from '../utils/imageHelper.js';

const router = express.Router();

// All chat routes require JWT authentication
router.use(authMiddleware);

// 1. Get List of active conversations
router.get('/', async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const messages = await readTable('chats');
    const products = await readTable('products');
    const users = await readTable('users');

    // Filter messages belonging to the current user
    const userMessages = messages.filter(
      (m) => m.senderId === currentUserId || m.receiverId === currentUserId
    );

    // Group messages by conversation: productId + partnerId
    const conversationsMap = {};

    userMessages.forEach((msg) => {
      const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
      const key = `${msg.productId}_${partnerId}`;

      if (!conversationsMap[key]) {
        conversationsMap[key] = {
          productId: msg.productId,
          partnerId: partnerId,
          messages: [],
        };
      }
      conversationsMap[key].messages.push(msg);
    });

    // Map each group to conversation detail object
    const conversations = [];

    for (const key of Object.keys(conversationsMap)) {
      const group = conversationsMap[key];
      
      // Sort group messages descending to get the last message
      group.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const lastMessage = group.messages[0];

      // Count unread messages received by current user
      const unreadCount = group.messages.filter(
        (m) => m.receiverId === currentUserId && !m.read
      ).length;

      // Find partner details
      const partnerUser = users.find((u) => u._id === group.partnerId);
      if (!partnerUser || partnerUser.status === 'deleted') continue; // Skip if user no longer exists

      // Find product details
      const rawProduct = products.find((p) => p._id === group.productId);
      const product = rawProduct ? normalizeProduct(rawProduct, req) : {
        _id: group.productId,
        title: 'Unavailable Product',
        price: 0,
        images: []
      };

      conversations.push({
        productId: group.productId,
        partnerId: group.partnerId,
        product: {
          _id: product._id,
          title: product.title,
          price: product.price,
          images: product.images
        },
        partner: {
          _id: partnerUser._id,
          name: partnerUser.name,
          username: partnerUser.username,
          avatar: normalizeUser(partnerUser, req)?.avatar
        },
        lastMessage: {
          _id: lastMessage._id,
          text: lastMessage.text,
          senderId: lastMessage.senderId,
          receiverId: lastMessage.receiverId,
          createdAt: lastMessage.createdAt,
          read: lastMessage.read
        },
        unreadCount
      });
    }

    // Sort conversations by last message timestamp descending
    conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.status(200).json(conversations);
  } catch (err) {
    next(err);
  }
});

// 2. Get message history for a conversation
router.get('/:productId/:partnerId', async (req, res, next) => {
  try {
    const { productId, partnerId } = req.params;
    const currentUserId = req.user._id;

    const messages = await readTable('chats');
    const users = await readTable('users');
    const products = await readTable('products');

    // Fetch conversation partner details
    const partnerUser = users.find((u) => u._id === partnerId);
    if (!partnerUser) {
      return res.status(404).json({ message: 'Conversation partner not found' });
    }

    // Filter messages for this conversation
    const convoMessages = messages.filter((m) => {
      return (
        m.productId === productId &&
        ((m.senderId === currentUserId && m.receiverId === partnerId) ||
          (m.senderId === partnerId && m.receiverId === currentUserId))
      );
    });

    // Mark unread received messages as read
    let updated = false;
    convoMessages.forEach((m) => {
      if (m.receiverId === currentUserId && !m.read) {
        m.read = true;
        updated = true;
      }
    });

    if (updated) {
      // Find indexes in global message list and update them
      const updatedMessages = messages.map((m) => {
        const match = convoMessages.find((cm) => cm._id === m._id);
        return match ? match : m;
      });
      await writeTable('chats', updatedMessages);
    }

    // Sort chronological (ascending)
    convoMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Return messages, partner details and product info
    const rawProduct = products.find((p) => p._id === productId);
    const product = rawProduct ? normalizeProduct(rawProduct, req) : null;

    res.status(200).json({
      product: product ? {
        _id: product._id,
        title: product.title,
        price: product.price,
        images: product.images,
        sellerId: product.sellerId
      } : null,
      partner: {
        _id: partnerUser._id,
        name: partnerUser.name,
        username: partnerUser.username,
        avatar: normalizeUser(partnerUser, req)?.avatar
      },
      messages: convoMessages
    });
  } catch (err) {
    next(err);
  }
});

// 3. Send a message
router.post('/', async (req, res, next) => {
  try {
    const { productId, receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!productId || !receiverId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Missing parameters or empty message' });
    }

    const users = await readTable('users');
    const receiver = users.find((u) => u._id === receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Message receiver not found' });
    }

    const products = await readTable('products');
    const product = products.find((p) => p._id === productId);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    const messages = await readTable('chats');

    const newMessage = {
      _id: generateId('msg'),
      productId,
      senderId,
      receiverId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      read: false
    };

    messages.push(newMessage);
    await writeTable('chats', messages);

    // Create Notification for the receiver
    const notifications = await readTable('notifications');
    notifications.push({
      _id: generateId('n'),
      userId: receiverId,
      type: 'chat_message',
      title: `${req.user.name} sent you a message`,
      body: text.trim().length > 60 ? `${text.trim().substring(0, 60)}...` : text.trim(),
      relatedProductId: productId,
      relatedUserId: senderId,
      read: false,
      createdAt: new Date().toISOString()
    });
    await writeTable('notifications', notifications);

    res.status(201).json(newMessage);
  } catch (err) {
    next(err);
  }
});

export default router;
