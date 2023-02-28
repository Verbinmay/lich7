export type APIErrorResult = Array<FieldError>;

export type FieldError = {
  message: string;
  field: string;
};