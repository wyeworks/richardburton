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

type PublicationKey = keyof Publication;
type PublicationError = null | string | Record<PublicationKey, string>;
type PublicationEntry = { publication: Publication; errors: PublicationError };

type StoredPublication = PublicationEntry[] | undefined;

const ATOM = atom<StoredPublication>({
  key: "publications",
  default: undefined,
});

const ERROR_MESSAGES: Record<string, string> = {
  conflict: "A publication with this data already exists",
  required: "This field is required and cannot be blank",
  integer: "This field should be an integer",
};
interface PublicationModule {
  ATTRIBUTES: PublicationKey[];
  ATTRIBUTE_LABELS: Record<PublicationKey, string>;

  STORE: {
    useValue(): StoredPublication;
    useSet(): SetterOrUpdater<StoredPublication>;
    useReset(): Resetter;
  };

  describe(error: PublicationError, scope?: PublicationKey): string;
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

export type { PublicationKey, PublicationEntry, PublicationError };
export { Publication };
