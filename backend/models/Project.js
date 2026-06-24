import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    required: true,
    default: 'Web'
  },
  link: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const MongooseProject = mongoose.model('Project', projectSchema);
const JsonProject = new JsonModel('Project');

const ProjectProxy = new Proxy(MongooseProject, {
  get(target, prop) {
    if (global.useJsonDb) {
      return JsonProject[prop];
    }
    return MongooseProject[prop];
  },
  construct(target, args) {
    if (global.useJsonDb) {
      return new JsonProject.InstanceClass(...args);
    }
    return new MongooseProject(...args);
  }
});

export default ProjectProxy;
