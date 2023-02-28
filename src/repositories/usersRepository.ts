import { countTotalAndPages, createFilterSort } from "../paginator";
import { UserDBModel } from "../types/dbType";
import { PaginatorEnd, PaginatorStart } from "../types/paginatorType";
import { usersCollections } from "./db";

export const usersRepository = {
  //POST
  async createUser(createdUser: any) {
    const result = await usersCollections.insertOne(createdUser);
    const addId = await usersCollections.findOneAndUpdate(
      { _id: result.insertedId },
      {
        $set: {
          id: result.insertedId.toString(),
        },
      },
      { returnDocument: "after" }
    );
    return addId.value!;
  },

  //GET
  async findUsers(paginatorStartInfo: PaginatorStart) {
    const filter: any = paginatorStartInfo.searchLoginTerm
      ? paginatorStartInfo.searchEmailTerm
        ? {
            $or: [
              {
                login: {
                  $regex: "(?i)" + paginatorStartInfo.searchLoginTerm + "(?-i)",
                },
              },
              {
                email: {
                  $regex: "(?i)" + paginatorStartInfo.searchEmailTerm + "(?-i)",
                },
              },
            ],
          }
        : {
            login: {
              $regex: "(?i)" + paginatorStartInfo.searchLoginTerm + "(?-i)",
            },
          }
      : paginatorStartInfo.searchEmailTerm
      ? {
          email: {
            $regex: "(?i)" + paginatorStartInfo.searchEmailTerm + "(?-i)",
          },
        }
      : {};

    const filterSort: any = createFilterSort(
      paginatorStartInfo.sortBy,
      paginatorStartInfo.sortDirection
    );
    const counterPages: {
      pagesCount: number;
      totalCount: number;
    } = await countTotalAndPages(
      usersCollections,
      filter,
      paginatorStartInfo.pageSize
    );
    const result = await usersCollections
      .find(filter)
      .sort(filterSort)
      .skip((paginatorStartInfo.pageNumber - 1) * paginatorStartInfo.pageSize)
      .limit(paginatorStartInfo.pageSize)
      .toArray();

    const paginatorEndInfo: PaginatorEnd = {
      pagesCount: counterPages.pagesCount,
      page: paginatorStartInfo.pageNumber,
      pageSize: paginatorStartInfo.pageSize,
      totalCount: counterPages.totalCount,
    };
    return { paginatorEndInfo: paginatorEndInfo, result: result };
  },
  //GETBYID
  async findUserById(id: string) {
    const result: UserDBModel | null = await usersCollections.findOne({
      id: id,
    });
    return result;
  },

  //DELETE
  async deleteUser(id: string) {
    const result = await usersCollections.deleteOne({ id: id });
    return result.deletedCount === 1;
  },

async updateCodeAndDate(confimationCode:string, expirationDate:Date, id:string){
  const result = await usersCollections.findOneAndUpdate({id:id},{$set:{"emailConfimation.confimationCode":confimationCode, "emailConfimation.expirationDate":expirationDate }},
  { returnDocument: "after" }
  )
  return result.value!
}

};


