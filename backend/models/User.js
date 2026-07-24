import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { JsonModel } from '../config/jsonDb.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  isAdmin: { type: Boolean, default: false }
}, {
  timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const MongooseUser = mongoose.model('User', userSchema);
const JsonUser = new JsonModel('User');

const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (global.useJsonDb) {
      return JsonUser[prop];
    }
    return MongooseUser[prop];
  },
  construct(target, args) {
    if (global.useJsonDb) {
      return new JsonUser.InstanceClass(...args);
    }
    return new MongooseUser(...args);
  }
});

export default UserProxy;
