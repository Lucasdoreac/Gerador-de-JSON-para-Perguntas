
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  statement: string;
  options: Option[];
}

export interface QuestionFile {
  questions: Question[];
}
