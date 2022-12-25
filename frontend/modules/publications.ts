import {
  atom,
  Resetter,
  SetterOrUpdater,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import { isString, isNumber } from "lodash";

type Publication = {
  title: string;
  country: string;
  year: number;
  publisher: string;
  authors: string;
  originalTitle: string;
  originalAuthors: string;
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

type FlatPublicationError = null | string | Record<PublicationKey, string>;

type PublicationEntry = {
  publication: Publication;
  errors: FlatPublicationError;
};

type PublicationKey = keyof Publication;

function flatten(error: PublicationError): FlatPublicationError {
  if (error === null || isString(error)) return error;

  let authors, originalTitle, originalAuthors;

  if (error.translatedBook) {
    authors = error.translatedBook.authors;

    if (error.translatedBook.originalBook) {
      originalTitle = error.translatedBook.originalBook.title;
      originalAuthors = error.translatedBook.originalBook.authors;
    }
  }
  const { title, year, country, publisher } = error;

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

type StoredPublication = PublicationEntry[] | undefined;

const ATOM = atom<StoredPublication>({
  key: "publications",
  default: undefined,
});

const ERROR_MESSAGES: Record<string, string> = {
  conflict: "A publication with this data already exists",
  required: "This field is required and cannot be blank",
};
interface PublicationModule {
  ATTRIBUTES: PublicationKey[];
  ATTRIBUTE_LABELS: Record<PublicationKey, string>;

  STORE: {
    useValue(): StoredPublication;
    useSet(): SetterOrUpdater<StoredPublication>;
    useReset(): Resetter;
  };

  flatten(publications: PublicationError): FlatPublicationError;

  describe(error: FlatPublicationError, scope?: PublicationKey): string;
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
  PublicationKey,
  PublicationEntry,
  FlatPublicationError,
  PublicationError,
};
export { Publication };
