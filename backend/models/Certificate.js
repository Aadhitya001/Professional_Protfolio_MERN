import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const certificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  verificationUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    default: 'Other'
  }
}, {
  timestamps: true
});

const MongooseCertificate = mongoose.model('Certificate', certificateSchema);
const JsonCertificate = new JsonModel('Certificate');

const CertificateProxy = new Proxy(MongooseCertificate, {
  get(target, prop) {
    if (global.useJsonDb) {
      return JsonCertificate[prop];
    }
    return MongooseCertificate[prop];
  },
  construct(target, args) {
    if (global.useJsonDb) {
      return new JsonCertificate.InstanceClass(...args);
    }
    return new MongooseCertificate(...args);
  }
});

export default CertificateProxy;
