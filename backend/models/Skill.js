import mongoose from 'mongoose';
import { JsonModel } from '../config/jsonDb.js';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 80
  },
  category: {
    type: String,
    required: true,
    default: 'Frontend'
  }
}, {
  timestamps: true
});

const MongooseSkill = mongoose.model('Skill', skillSchema);
const JsonSkill = new JsonModel('Skill');

const SkillProxy = new Proxy(MongooseSkill, {
  get(target, prop) {
    if (global.useJsonDb) {
      return JsonSkill[prop];
    }
    return MongooseSkill[prop];
  },
  construct(target, args) {
    if (global.useJsonDb) {
      return new JsonSkill.InstanceClass(...args);
    }
    return new MongooseSkill(...args);
  }
});

export default SkillProxy;
