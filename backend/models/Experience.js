import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const experienceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['work', 'education'],
    default: 'work'
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    required: true
  },
  description: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const MongooseExperience = mongoose.model('Experience', experienceSchema);
const JsonExperience = new JsonModel('Experience', { description: [] });

const ExperienceProxy = new Proxy(MongooseExperience, {
  get(target, prop) {
    if (global.useJsonDb) {
      return JsonExperience[prop];
    }
    return MongooseExperience[prop];
  },
  construct(target, args) {
    if (global.useJsonDb) {
      return new JsonExperience.InstanceClass(...args);
    }
    return new MongooseExperience(...args);
  }
});

export default ExperienceProxy;
