import * as monaco from "monaco-editor";

export enum EditorProblemSeverity {
  Hint = 1,
  Info = 2,
  Warning = 3,
  Error = 4,
}

export type EditorProblem = {
  message: string;
  severity: EditorProblemSeverity;
};

export const problemSeverityMap: Record<monaco.MarkerSeverity, EditorProblemSeverity> = {
  [monaco.MarkerSeverity.Hint]: EditorProblemSeverity.Hint,
  [monaco.MarkerSeverity.Info]: EditorProblemSeverity.Info,
  [monaco.MarkerSeverity.Warning]: EditorProblemSeverity.Warning,
  [monaco.MarkerSeverity.Error]: EditorProblemSeverity.Error,
};
