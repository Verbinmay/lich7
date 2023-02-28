import bcrypt from "bcrypt";
import { jwtService } from "../application/jwtService";
import { usersRepository } from "../repositories/usersRepository";
import { UserDBModel } from "../types/dbType";

export const authService = {
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
}