import express from 'express';
import { readTable, writeTable } from '../utils/db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// 1. Get user's notifications (newest first)
router.get('/', async (req, res, next) => {
  try {
    const notifications = await readTable('notifications');
    const myAlerts = notifications.filter(n => n.userId === req.user._id);

    // Sort newest first
    myAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(myAlerts);
  } catch (err) {
    next(err);
  }
});

// 2. Mark all user notifications as read
router.put('/read-all', async (req, res, next) => {
  try {
    const notifications = await readTable('notifications');

    notifications.forEach(n => {
      if (n.userId === req.user._id) {
        n.read = true;
      }
    });

    await writeTable('notifications', notifications);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

// 3. Mark a single notification as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;
    const notifications = await readTable('notifications');
    const idx = notifications.findIndex(n => n._id === id && n.userId === req.user._id);

    if (idx === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notifications[idx].read = true;
    await writeTable('notifications', notifications);

    res.status(200).json(notifications[idx]);
  } catch (err) {
    next(err);
  }
});

export default router;
