type Publication = {
  title: string;
  country: string;
  year: number;
  publisher: string;
};

type OriginalBook = {
  authors: string;
  title: string;
};

type TranslatedBook = {
  authors: string;
  originalBook: OriginalBook;
  publications: Publication[];
};

export type { TranslatedBook };
