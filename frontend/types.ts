type Publication = {
  title: string;
  country: string;
  year: number;
  publisher: string;
};

type OriginalBook = {
  title: string;
  authors: string;
};

type TranslatedBook = {
  authors: string;
  originalBook: OriginalBook;
  publications: Publication[];
};

type FlatPublication = Publication & {
  originalTitle: OriginalBook["title"];
  originalAuthors: OriginalBook["authors"];
  authors: TranslatedBook["authors"];
};

type FlatPublicationKey = keyof FlatPublication;

const PUBLICATION_ATTRIBUTES: FlatPublicationKey[] = [
  "originalTitle",
  "originalAuthors",
  "title",
  "authors",
  "year",
  "country",
  "publisher",
];

const PUBLICATION_ATTRIBUTE_LABELS: Record<FlatPublicationKey, string> = {
  authors: "Translators",
  originalAuthors: "Original Authors",
  originalTitle: "Original Title",
  country: "Country",
  publisher: "Publisher",
  title: "Title",
  year: "Year",
};

export { PUBLICATION_ATTRIBUTES, PUBLICATION_ATTRIBUTE_LABELS };
export type { TranslatedBook, FlatPublication, FlatPublicationKey };
