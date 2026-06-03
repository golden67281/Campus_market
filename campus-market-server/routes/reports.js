import express from 'express';
import { readTable, writeTable, generateId } from '../utils/db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// 1. Report a listing
router.post('/listing/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, detail } = req.body;
    const reporterId = req.user._id;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required to file a report' });
    }

    const reports = await readTable('reports');
    const newReport = {
      _id: generateId('r'),
      reporterId,
      targetType: 'product',
      targetId: id,
      reason,
      detail: detail || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    reports.push(newReport);
    await writeTable('reports', reports);

    // Auto flag logic (e.g. if a listing gets reported, we could flag it)
    // For mock simplicity, let's just log it and send confirmation
    console.log(`[REPORT AUDIT] Listing ${id} reported by user ${reporterId} for "${reason}"`);

    res.status(200).json({ message: 'Report submitted successfully. Thank you.' });
  } catch (err) {
    next(err);
  }
});

// 2. Report a user
router.post('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, detail } = req.body;
    const reporterId = req.user._id;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required to file a report' });
    }

    const reports = await readTable('reports');
    const newReport = {
      _id: generateId('r'),
      reporterId,
      targetType: 'user',
      targetId: id,
      reason,
      detail: detail || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    reports.push(newReport);
    await writeTable('reports', reports);

    console.log(`[REPORT AUDIT] User ${id} reported by reporter ${reporterId} for "${reason}"`);

    res.status(200).json({ message: 'Report submitted successfully. Thank you.' });
  } catch (err) {
    next(err);
  }
});

export default router;
