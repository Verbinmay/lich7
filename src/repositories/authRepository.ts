import { UserDBModel } from "../types/dbType";
import { usersCollections } from "./db";

export const authRepository = {
  //GETUSER BY LOGINOREMAIL
  async findUserByLoginOrEmail(loginOrEmail: string) {
    const result: UserDBModel | null = await usersCollections.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    return result;
  },

  //FIND USERS BY LOGIN AND EMAIL
  async findUsersByLoginAndEmail(login: string, email: string) {
    const result: UserDBModel[] | null = await usersCollections.find({
      $or: [
        { login: login },
        { email: email },
        { email: login },
        { login: email },
      ],
    }).toArray();
    return result;
  },
};
