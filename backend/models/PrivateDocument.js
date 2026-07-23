import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const privateDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Aadhaar', 'PAN', 'Bank Passbook', 'Driving License', 'Passport', 'Marksheet', 'Other'],
    default: 'Other'
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true // base64 data URL
  }
}, {
  timestamps: true
});

const MongoosePrivateDocument = mongoose.model('PrivateDocument', privateDocumentSchema);
const JsonPrivateDocument = new JsonModel('PrivateDocument');

const PrivateDocumentProxy = new Proxy(MongoosePrivateDocument, {
  get(target, prop) {
    if (global.useJsonDb) return JsonPrivateDocument[prop];
    return MongoosePrivateDocument[prop];
  },
  construct(target, args) {
    if (global.useJsonDb) return new JsonPrivateDocument.InstanceClass(...args);
    return new MongoosePrivateDocument(...args);
  }
});

export default PrivateDocumentProxy;
