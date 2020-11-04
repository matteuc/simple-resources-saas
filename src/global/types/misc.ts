export type None = null | undefined;

export type Maybe<T> = T | None;

export interface UniqueDocument {
  id: string;
}

export type FormFieldData = {
  message: Maybe<string>;
  error: boolean;
  validating: boolean;
  value: any;
  valid: boolean;
};

export type FormData = {
  [key: string]: FormFieldData;
};

export type ValidationMap = {
  [key: string]:
    | ((value: any) => Maybe<string>)
    | ((value: any) => Promise<Maybe<string>>);
};
