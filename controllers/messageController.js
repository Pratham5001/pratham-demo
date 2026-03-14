const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');

const getConversationId = (uid1, uid2) => [uid1, uid2].sort().join('_');

exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender receiver', 'name avatar').populate('product', 'title images').sort({ createdAt: -1 });

    const conversationsMap = {};
    for (const msg of messages) {
      const other = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
      const key = msg.conversationId;
      if (!conversationsMap[key]) {
        conversationsMap[key] = { other, lastMessage: msg, product: msg.product, unread: 0 };
      }
      if (!msg.read && msg.receiver._id.toString() === req.user._id.toString()) {
        conversationsMap[key].unread++;
      }
    }
    res.render('messages/index', { conversations: Object.values(conversationsMap), user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.getChat = async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.userId).select('-password');
    if (!otherUser) return res.render('error', { message: 'User not found', user: req.user });
    const conversationId = getConversationId(req.user._id.toString(), req.params.userId);
    const messages = await Message.find({ conversationId }).populate('sender', 'name avatar').sort({ createdAt: 1 });
    await Message.updateMany({ conversationId, receiver: req.user._id, read: false }, { read: true });
    const product = req.query.product ? await Product.findById(req.query.product) : null;
    res.render('messages/chat', { otherUser, messages, conversationId, product, user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content, productId } = req.body;
    const conversationId = getConversationId(req.user._id.toString(), req.params.userId);
    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      product: productId || null,
      content,
      conversationId
    });
    const populated = await Message.findById(message._id).populate('sender', 'name avatar');
    res.json({ success: true, message: populated });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
