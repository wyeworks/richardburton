import {
  atom,
  Resetter,
  SetterOrUpdater,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import { isString, isNumber } from "lodash";

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

type PublicationError = null | Partial<{
  title: string;
  country: string;
  year: string;
  publisher: string;
  translatedBook: {
    authors: string;
    originalBook: {
      title: string;
      authors: string;
    };
  };
}>;

type FlatPublicationError = null | string | Record<FlatPublicationKey, string>;

type FlatPublicationEntry = {
  publication: FlatPublication;
  errors: FlatPublicationError;
};

type FlatPublicationKey = keyof FlatPublication;

function isPublication(p: Publication | PublicationError): p is Publication {
  return (
    !!p &&
    !isString(p) &&
    isString(p.title) &&
    isString(p.country) &&
    isString(p.publisher) &&
    isString(p.country) &&
    isNumber(p.year) &&
    !!p.translatedBook &&
    isString(p.translatedBook.authors) &&
    !!p.translatedBook.originalBook &&
    isString(p.translatedBook.originalBook.title) &&
    isString(p.translatedBook.originalBook.authors)
  );
}

function flatten(publication: Publication): FlatPublication;
function flatten(error: PublicationError): FlatPublicationError;
function flatten(p: Publication | PublicationError) {
  if (isPublication(p)) {
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
  } else {
    if (p === null || isString(p)) return p;

    let authors, originalTitle, originalAuthors;

    if (p.translatedBook) {
      authors = p.translatedBook.authors;

      if (p.translatedBook.originalBook) {
        originalTitle = p.translatedBook.originalBook.title;
        originalAuthors = p.translatedBook.originalBook.authors;
      }
    }
    const { title, year, country, publisher } = p;

    return {
      originalTitle,
      originalAuthors,
      authors,
      title,
      year,
      country,
      publisher,
    } as FlatPublicationError;
  }
}

type StoredPublication = FlatPublicationEntry[] | undefined;

const ATOM = atom<StoredPublication>({
  key: "publications",
  default: undefined,
});

const ERROR_MESSAGES: Record<string, string> = {
  conflict: "A publication with this data already exists",
  required: "This field is required and cannot be blank",
};
interface PublicationModule {
  ATTRIBUTES: FlatPublicationKey[];
  ATTRIBUTE_LABELS: Record<FlatPublicationKey, string>;

  STORE: {
    useValue(): StoredPublication;
    useSet(): SetterOrUpdater<StoredPublication>;
    useReset(): Resetter;
  };

  flatten(publication: Publication): FlatPublication;
  flatten(publications: PublicationError): FlatPublicationError;

  describe(error: FlatPublicationError, scope?: FlatPublicationKey): string;
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
  STORE: {
    useValue() {
      return useRecoilValue(ATOM);
    },
    useSet() {
      return useSetRecoilState(ATOM);
    },
    useReset() {
      return useResetRecoilState(ATOM);
    },
  },
  flatten,
  describe(error, scope) {
    if (!error) {
      return "";
    } else if (!scope) {
      if (isString(error)) {
        return ERROR_MESSAGES[error] || error;
      } else {
        return "";
      }
    } else {
      if (isString(error)) {
        return "";
      } else {
        return ERROR_MESSAGES[error[scope]] || error[scope];
      }
    }
  },
};

export type {
  FlatPublication,
  FlatPublicationKey,
  FlatPublicationEntry,
  FlatPublicationError,
  PublicationError,
};
export { Publication };
