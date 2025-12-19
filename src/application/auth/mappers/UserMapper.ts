import { User } from "@domain/auth/User";

export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export class UserMapper {
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
