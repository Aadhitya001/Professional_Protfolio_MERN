import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const documentAccessSchema = new mongoose.Schema({
  accessToken: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true // e.g. "HR - TCS", "Bank Manager"
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewerName: {
    type: String,
    default: ''
  },
  viewerEmail: {
    type: String,
    default: ''
  },
  viewedAt: {
    type: Date,
    default: null
  },
  viewCount: {
    type: Number,
    default: 0
  },
  viewers: {
    type: [{
      name: String,
      email: String,
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  documentIds: {
    type: [String], // Array of PrivateDocument _id strings
    default: []    // Empty = all documents (backward compat)
  },
  allowDownload: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const MongooseDocumentAccess = mongoose.model('DocumentAccess', documentAccessSchema);
const JsonDocumentAccess = new JsonModel('DocumentAccess', { viewers: [], documentIds: [], viewCount: 0 });

const DocumentAccessProxy = new Proxy(MongooseDocumentAccess, {
  get(target, prop) {
    if (global.useJsonDb) return JsonDocumentAccess[prop];
    return MongooseDocumentAccess[prop];
  },
  construct(target, args) {
    if (global.useJsonDb) return new JsonDocumentAccess.InstanceClass(...args);
    return new MongooseDocumentAccess(...args);
  }
});

export default DocumentAccessProxy;
