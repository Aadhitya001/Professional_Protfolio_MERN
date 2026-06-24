import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: false
  },
  subject: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const MongooseMessage = mongoose.model('Message', messageSchema);
const JsonMessage = new JsonModel('Message', { read: false });

const MessageProxy = new Proxy(MongooseMessage, {
  get(target, prop) {
    if (global.useJsonDb) {
      return JsonMessage[prop];
    }
    return MongooseMessage[prop];
  },
  construct(target, args) {
    if (global.useJsonDb) {
      return new JsonMessage.InstanceClass(...args);
    }
    return new MongooseMessage(...args);
  }
});

export default MessageProxy;
