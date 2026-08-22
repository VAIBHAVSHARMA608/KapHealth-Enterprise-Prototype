const Notification = require("../models/Notification");

async function listMyNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { user: req.user.id };
    if (unreadOnly === "true") filter.readAt = null;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user.id, readAt: null }),
    ]);

    res.json({ notifications, total, unreadCount, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ user: req.user.id, readAt: null }, { readAt: new Date() });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyNotifications, markRead, markAllRead };
