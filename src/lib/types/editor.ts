export type State = "init" | "empty" | "loaded" | "modified" | "invalid" | "errored" | "built" | "signed" | "corrected";

export type DocumentHeader = {
  label: string;
  slug: string;
};
