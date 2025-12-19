import { IStorage } from "@domain/shared/IStorage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export class TokenStorage {
  constructor(private readonly storage: IStorage) {}

  async saveToken(token: string): Promise<void> {
    await this.storage.setItem(TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return await this.storage.getItem(TOKEN_KEY);
  }

  async removeToken(): Promise<void> {
    await this.storage.removeItem(TOKEN_KEY);
  }

  async saveUser(user: unknown): Promise<void> {
    await this.storage.setItem(USER_KEY, JSON.stringify(user));
  }

  async getUser<T>(): Promise<T | null> {
    const data = await this.storage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  async removeUser(): Promise<void> {
    await this.storage.removeItem(USER_KEY);
  }

  async clear(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  }
}
