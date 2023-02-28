import bcrypt from "bcrypt";
import { jwtService } from "../application/jwtService";
import { authRepository } from "../repositories/authRepository";
import { usersRepository } from "../repositories/usersRepository";
import { UserDBModel } from "../types/dbType";
import { v4 as uuidv4 } from "uuid";
import add from "date-fns/add";

export const authService = {
  //AUTHPOST
  async postAuth(loginOrEmail: string, password: string) {
    const userFindLoginOrEmail: UserDBModel | null =
      await authRepository.findUserByLoginOrEmail(loginOrEmail);
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
  //CREATE USER
  async createUser(login: string, email: string, password: string) {
    const hashBcrypt = await bcrypt.hash(password, 10);

    const createdUser = {
      login: login,
      email: email,
      createdAt: new Date().toISOString(),
      hash: hashBcrypt,
      emailConfimation: {
        confimationCode: uuidv4(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
      isConfirmed: false,
      },
    };
    const result: UserDBModel = await usersRepository.createUser(createdUser);
    return result;
  },

  //CONFIRMEMAIL
  async confirmEmail(code: string) {
    const userFind: UserDBModel|null = await authRepository.findUserByConfimationCode(code);
    if (!userFind) {
      return false;
    }
    if (userFind.emailConfimation.isConfirmed) {
      return false;
    }
    if (userFind.emailConfimation.confimationCode !== code) {
      return false;
    }
    if (userFind.emailConfimation.expirationDate < new Date()) {
      return false;
    }
    const result:boolean = await authRepository.updateConfirmation(userFind.id);
    return result;
  },

  //RESENDING EMAIL

  async resendingEmail(email: string) {
    const userFind: UserDBModel | null = await authRepository.findUserByEmail(
      email
    );
    if (!userFind) {
      return null }
      if (userFind.emailConfimation.isConfirmed) {
        return false;
      }
    const confimationCode = uuidv4();
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    });
    const userUpdate: UserDBModel = await usersRepository.updateCodeAndDate(
      confimationCode,
      expirationDate,
      userFind.id
    );
    return userUpdate;
  },
};
