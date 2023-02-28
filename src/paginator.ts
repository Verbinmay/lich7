import { PaginatorEnd, PaginatorStart } from "./types/paginatorType";

export const paginator = (query: any): PaginatorStart => {
  return {
    searchNameTerm: query.searchNameTerm ? query.searchNameTerm : "", //default null
    sortBy: query.sortBy ? query.sortBy : "createdAt",
    sortDirection: query.sortDirection ? query.sortDirection : "desc",
    pageNumber: query.pageNumber ? Number(query.pageNumber) : 1,
    pageSize: query.pageSize ? Number(query.pageSize) : 10,
    searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : null,
    searchEmailTerm: query.searchEmailTerm ? query.searchEmailTerm : null,
  };
};

export const createFilterSort = (sortBy: string, sortDirection: string) => {
  return { [sortBy]: sortDirection === "desc" ? -1 : 1 };
};

export const countTotalAndPages = async (
  collections: any,
  filter: any,
  pageSize: number
): Promise<{ pagesCount: number; totalCount: number }> => {
  const totalCount = await collections.countDocuments(filter);
  const pagesCount = Math.ceil(totalCount / pageSize);
  return { totalCount: totalCount, pagesCount: pagesCount };
};
