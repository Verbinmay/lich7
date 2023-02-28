import { ObjectId } from "mongodb";
import { countTotalAndPages, createFilterSort } from "../paginator";
import { BlogDBModel, PostDBModel, UserDBModel } from "../types/dbType";
import { PaginatorEnd, PaginatorStart } from "../types/paginatorType";
import { blogsCollections, postsCollections } from "./db";

export const blogsRepository = {
  //GET
  async findBlogs(paginatorStartInfo: PaginatorStart) {
    const filterName: any = paginatorStartInfo.searchNameTerm
      ? {
          name: {
            $regex: "(?i)" + paginatorStartInfo.searchNameTerm + "(?-i)",
          },
        }
      : {};

    const filterSort: any = createFilterSort(
      paginatorStartInfo.sortBy,
      paginatorStartInfo.sortDirection
    );

    const pagesCounter: { pagesCount: number; totalCount: number } =
      await countTotalAndPages(
        blogsCollections,
        filterName,
        paginatorStartInfo.pageSize
      );

    let result: Array<BlogDBModel> = await blogsCollections
      .find(filterName)
      .sort(filterSort)
      .skip((paginatorStartInfo.pageNumber - 1) * paginatorStartInfo.pageSize)
      .limit(paginatorStartInfo.pageSize)
      .toArray();

    const paginatorEndInfo: PaginatorEnd = {
      pagesCount: pagesCounter.pagesCount,
      page: paginatorStartInfo.pageNumber,
      pageSize: paginatorStartInfo.pageSize,
      totalCount: pagesCounter.totalCount,
    };
    return { paginatorEndInfo: paginatorEndInfo, result: result };
  },
  async findBlogById(id: string) {
    const result: BlogDBModel | null = await blogsCollections.findOne({
      id: id,
    });
    return result;
  },
  //POST
  async createBlog(createdBlog: any) {
    const result = await blogsCollections.insertOne(createdBlog);
    const addId = await blogsCollections.findOneAndUpdate(
      { _id: result.insertedId },
      { $set: { id: result.insertedId.toString() } },
      { returnDocument: "after" }
    );
    return addId.value!;
  },
  //UPDATE
  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ) {
    const result = await blogsCollections.updateOne(
      { id: id },
      { $set: { name: name, description: description, websiteUrl: websiteUrl } }
    );
    const nameChanged = await postsCollections.updateMany(
      { blogId: id },
      { $set: { blogName: name } }
    );
    return result.matchedCount === 1;
  },

  //DELETE
  async deleteBlog(id: string) {
    const result = await blogsCollections.deleteOne({ id: id });
    return result.deletedCount === 1;
  },

  //POST-POST-BLOGID
  async postPostByBlogId(createdPost: any) {
    const result = await postsCollections.insertOne(createdPost);
    const addId = await postsCollections.findOneAndUpdate(
      { _id: result.insertedId },
      { $set: { id: result.insertedId.toString() } },{ returnDocument: "after" }
    );
    return addId.value;
  },

  //GET-POST-BLOGID
  async findPostsByBlogId(paginatorStartInfo: PaginatorStart, id: string) {
    const filter: any = { blogId: id };

    const filterSort: any = {};
    filterSort[paginatorStartInfo.sortBy as keyof typeof filterSort] =
      paginatorStartInfo.sortDirection === "desc" ? -1 : 1;

    //function
    const pagesCounter: { pagesCount: number; totalCount: number } =
      await countTotalAndPages(
        postsCollections,
        filter,
        paginatorStartInfo.pageSize
      );

    const result: Array<PostDBModel> = await postsCollections
      .find(filter)
      .sort(filterSort)
      .skip((paginatorStartInfo.pageNumber - 1) * paginatorStartInfo.pageSize)
      .limit(paginatorStartInfo.pageSize)
      .toArray();

    const paginatorEndInfo: PaginatorEnd = {
      pagesCount: pagesCounter.pagesCount,
      page: paginatorStartInfo.pageNumber,
      pageSize: paginatorStartInfo.pageSize,
      totalCount: pagesCounter.totalCount,
    };
    return { paginatorEndInfo: paginatorEndInfo, result: result };
  },
};
