import usersRepository from './users.repository';
import { User, CreateUserDto, UpdateUserDto } from './users.types';

class UsersService {
  async getAllUsers(): Promise<User[]> {
    return usersRepository.findAll();
  }

  async getUserById(id: number): Promise<User> {
    return usersRepository.findById(id);
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    return usersRepository.create(userData);
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    return usersRepository.update(id, userData);
  }

  async deleteUser(id: number): Promise<void> {
    return usersRepository.delete(id);
  }
}

export default new UsersService();
