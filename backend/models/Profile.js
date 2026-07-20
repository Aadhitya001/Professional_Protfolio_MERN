import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'John Doe'
  },
  title: {
    type: String,
    required: true,
    default: 'Full Stack Engineer'
  },
  bio: {
    type: String,
    default: ''
  },
  bioDetails: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  corePrinciples: {
    type: [{
      title: String,
      description: String
    }],
    default: [
      { title: 'Premium Aesthetics', description: 'Focus on clean alignment, rich micro-animations, and striking visual contrasts.' },
      { title: 'Clean Architecture', description: 'Writing modular components and highly structured backend APIs.' }
    ]
  }
}, {
  timestamps: true
});

const MongooseProfile = mongoose.model('Profile', profileSchema);
const JsonProfile = new JsonModel('Profile');

const ProfileProxy = new Proxy(MongooseProfile, {
  get(target, prop) {
    if (global.useJsonDb) {
      return JsonProfile[prop];
    }
    return MongooseProfile[prop];
  },
  construct(target, args) {
    if (global.useJsonDb) {
      return new JsonProfile.InstanceClass(...args);
    }
    return new MongooseProfile(...args);
  }
});

export default ProfileProxy;
