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
    const result: UserDBModel[] = await usersCollections
      .find({
        $or: [
          { login: login },
          { email: email },
          { email: login },
          { login: email },
        ],
      })
      .toArray();
     
    return  result.length>0? true:false;
  },
  //FIND USER BY CONFIRM CODE
  async findUserByConfimationCode(code: string) {
    const result = await usersCollections.findOne({
      "emailConfimation.confimationCode": code,
    });
    return result;
  },
  //UPDATE CONFIRMATION
  async updateConfirmation(id: string) {
    const result = await usersCollections.updateOne(
      { id: id },
      { $set: { "emailConfimation.isConfirmed": true } }
    );
    return true;
  },
    //FIND USER BY CONFIRM CODE
    async findUserByEmail(email: string) {
      const result = await usersCollections.findOne({
        email: email,
      });
      return result;
    },
};
