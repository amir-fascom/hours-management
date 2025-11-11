export class Utils {
    static generateId() {
      return `${Date.now()}-${Math.ceil(Math.random() * 10000000)}`;
    }
  }