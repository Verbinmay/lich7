import { UserDBModel } from "../types";
import { BlogDBModel } from "./dbType";

declare global {
  declare namespace Express {
    export interface Request {
      user: ObjectId<UserDBModel> | null;
      blog: ObjectId<BlogDBModel> | null;
    }
  }
}
