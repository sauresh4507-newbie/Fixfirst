const Notification = require('../models/Notification');

/**
 * Create a notification and optionally emit via socket
 */
const createNotification = async ({ recipient, type, title, message, data = {}, link = null }, io = null) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      data,
      link,
    });

    // Emit real-time notification if socket.io is available
    if (io) {
      io.to(`user_${recipient}`).emit('notification', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        link: notification.link,
        createdAt: notification.createdAt,
        isRead: false,
      });
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error.message);
  }
};

module.exports = { createNotification };
