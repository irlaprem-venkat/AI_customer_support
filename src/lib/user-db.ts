import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "users.json");

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
}

export const getUsers = (): User[] => {
  if (!fs.existsSync(DB_PATH)) return [];
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
};

export const saveUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
};

export const findUserByEmail = (email: string) => {
  return getUsers().find((u) => u.email === email);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 12);
};
