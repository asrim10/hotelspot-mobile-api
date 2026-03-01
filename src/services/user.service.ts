import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repositories";
import bcryptjs from "bcryptjs";
let userRepository = new UserRepository();
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";

export class UserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username already in use");
    }
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);
    return newUser;
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }
    const payload = {
      id: user._id,
      email: user.email,
      username: user.email,
      password: user.password,
      fullName: user.fullName,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    return { token, user };
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserByID(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  async updateUser(userId: string, data: UpdateUserDTO) {
    const user = await userRepository.getUserByID(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // FIXED: guard with data.email check first — Flutter doesn't send email,
    // so data.email is undefined, which caused a crash or silent failure
    if (data.email && user.email !== data.email) {
      const emailExists = await userRepository.getUserByEmail(data.email);
      if (emailExists) {
        throw new HttpError(403, "Email already in use");
      }
    }

    if (data.username && user.username !== data.username) {
      const usernameExists = await userRepository.getUserByUsername(
        data.username,
      );
      if (usernameExists) {
        throw new HttpError(403, "Username already in use");
      }
    }

    if (data.password) {
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      data.password = hashedPassword;
    }

    const updatedUser = await userRepository.updateUser(userId, data);
    return updatedUser;
  }

  async deleteUser(userId: string) {
    const existingUser = await userRepository.getUserByID(userId);
    if (!existingUser) {
      throw new HttpError(404, "User not found");
    }

    const deleted = await userRepository.deleteUserById(userId);
    if (!deleted) {
      throw new HttpError(500, "Failed to delete user");
    }

    return { message: "User deleted successfully" };
  }
}
