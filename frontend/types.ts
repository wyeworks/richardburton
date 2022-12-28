type OriginalBook = {
  title: string;
  authors: string;
};

type TranslatedBook = {
  authors: string;
  originalBook: OriginalBook;
};

type Publication = {
  title: string;
  country: string;
  year: number;
  publisher: string;
  translatedBook: TranslatedBook;
};

type FlatPublication = Omit<Publication, "translatedBook"> & {
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

const toFlatPublication = (p: Publication): FlatPublication => {
  const {
    title,
    year,
    country,
    publisher,
    translatedBook: {
      authors,
      originalBook: { authors: originalAuthors, title: originalTitle },
    },
  } = p;

  return {
    originalTitle,
    originalAuthors,
    authors,
    title,
    year,
    country,
    publisher,
  };
};

const toFlatPublications = (ps: Publication[]): FlatPublication[] => {
  return ps.map(toFlatPublication);
};

const fromFlatPublication = (fp: FlatPublication): Publication => {
  const {
    originalTitle,
    originalAuthors,
    authors,
    title,
    year,
    country,
    publisher,
  } = fp;

  return {
    title,
    year,
    country,
    publisher,
    translatedBook: {
      authors,
      originalBook: {
        title: originalTitle,
        authors: originalAuthors,
      },
    },
  };
};

const fromFlatPublications = (fps: FlatPublication[]): Publication[] => {
  return fps.map(fromFlatPublication);
};

export {
  PUBLICATION_ATTRIBUTES,
  PUBLICATION_ATTRIBUTE_LABELS,
  toFlatPublications,
  fromFlatPublications,
};
export type { Publication, FlatPublication, FlatPublicationKey };