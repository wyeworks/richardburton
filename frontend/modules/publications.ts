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

function flatten(publication: Publication): FlatPublication;
function flatten(publications: Publication[]): FlatPublication[];
function flatten(p: Publication | Publication[]) {
  if (Array.isArray(p)) {
    return p.map((p) => flatten(p));
  } else {
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
  }
}

interface PublicationModule {
  ATTRIBUTES: FlatPublicationKey[];
  ATTRIBUTE_LABELS: Record<FlatPublicationKey, string>;
  flatten(publication: Publication): FlatPublication;
  flatten(publications: Publication[]): FlatPublication[];
}

const Publication: PublicationModule = {
  ATTRIBUTES: [
    "originalTitle",
    "originalAuthors",
    "title",
    "authors",
    "year",
    "country",
    "publisher",
  ],
  ATTRIBUTE_LABELS: {
    authors: "Translators",
    originalAuthors: "Original Authors",
    originalTitle: "Original Title",
    country: "Country",
    publisher: "Publisher",
    title: "Title",
    year: "Year",
  },
  flatten,
};

export type { FlatPublication, FlatPublicationKey };
export { Publication };
