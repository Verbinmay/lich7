import bcrypt from "bcrypt";
import { jwtService } from "../application/jwtService";
import { usersRepository } from "../repositories/usersRepository";
import { UserDBModel } from "../types/dbType";

export const usersService = {
  //POST
  async createUser(login: string, password: string, email: string) {
    const hashBcrypt = await bcrypt.hash(password, 10);

    const createdUser = {
      login: login,
      email: email,
      createdAt: new Date().toISOString(),
      hash: hashBcrypt,
    };
    const result: UserDBModel | null = await usersRepository.createUser(
      createdUser
    );
    return result;
  },

  //DELETE
  async deleteUser(id: string) {
    const result: boolean = await usersRepository.deleteUser(id);
    return result;
  },

  //AUTHPOST
  async postAuth(loginOrEmail: string, password: string) {
    const userFindLoginOrEmail: UserDBModel | null =
      await usersRepository.findUserByLoginOrEmail(loginOrEmail);
    if (userFindLoginOrEmail) {
      const match = await bcrypt.compare(password, userFindLoginOrEmail.hash);

      if (match) {
        const token = await jwtService.createJWT(userFindLoginOrEmail);
        return { accessToken: token };
      } else {
        return null;
      }
    } else {
      return null;
    }
  },
  
};
