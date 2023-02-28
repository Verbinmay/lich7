import { BlogViewModel } from "./blogsType";
import { CommentViewModel } from "./commentsType";
import { PostViewModel } from "./postsType";
import { UserViewModel } from "./userType";

export type PaginatorStart = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
};

export type PaginatorEnd = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
};

export type PaginatorBlog = PaginatorEnd & {
  items: Array<BlogViewModel>;
};

export type PaginatorPost = PaginatorEnd & {
  items: Array<PostViewModel>;
};

export type PaginatorUser = PaginatorEnd & {
  items: Array<UserViewModel>;
};

export type PaginatorCommentViewModel = PaginatorEnd & {
  items: Array<CommentViewModel>;
};
