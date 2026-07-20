import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import os from 'os';

const DATA_DIR = process.env.VERCEL 
  ? path.join(os.tmpdir(), 'data') 
  : path.resolve('data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class JsonModel {
  constructor(name, defaultFields = {}) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
    
    const self = this;
    this.InstanceClass = class {
      constructor(data) {
        Object.assign(this, defaultFields, data);
      }
      
      async save() {
        const data = self.read();
        
        if (self.name === 'User' && this.password && !this.password.startsWith('$2a$')) {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        }

        if (!this._id) {
          this._id = Math.random().toString(36).substring(2, 9);
          this.createdAt = new Date().toISOString();
          this.updatedAt = new Date().toISOString();
          data.push(this.toJSON());
        } else {
          this.updatedAt = new Date().toISOString();
          const index = data.findIndex(item => item._id === this._id);
          if (index !== -1) {
            data[index] = this.toJSON();
          } else {
            data.push(this.toJSON());
          }
        }
        self.write(data);
        return this;
      }

      async deleteOne() {
        if (!this._id) return;
        const data = self.read();
        const filtered = data.filter(item => item._id !== this._id);
        self.write(filtered);
      }

      async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      }

      toJSON() {
        const copy = { ...this };
        return copy;
      }
    };
  }

  read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  find(query = {}) {
    const data = this.read();
    let result = data.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }).map(item => new this.InstanceClass(item));

    result.sort = (sortOptions) => {
      const key = Object.keys(sortOptions)[0];
      const order = sortOptions[key];
      Array.prototype.sort.call(result, (a, b) => {
        if (a[key] < b[key]) return order === -1 ? 1 : -1;
        if (a[key] > b[key]) return order === -1 ? -1 : 1;
        return 0;
      });
      return result;
    };
    return result;
  }

  async findOne(query = {}) {
    const results = this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    const data = this.read();
    const item = data.find(item => item._id === id);
    return item ? new this.InstanceClass(item) : null;
  }

  async create(doc) {
    const instance = new this.InstanceClass(doc);
    return await instance.save();
  }

  async insertMany(docs) {
    const instances = [];
    for (let doc of docs) {
      const inst = await this.create(doc);
      instances.push(inst);
    }
    return instances;
  }

  async deleteMany() {
    this.write([]);
    return { deletedCount: 0 };
  }
}
