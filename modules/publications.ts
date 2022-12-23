import {
  atom,
  Resetter,
  SetterOrUpdater,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";

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

type FlatPublicationEntry = {
  publication: FlatPublication;
  errors: null | unknown;
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

type StoredPublication = FlatPublicationEntry[] | undefined;

const ATOM = atom<StoredPublication>({
  key: "publications",
  default: undefined,
});

interface PublicationModule {
  ATTRIBUTES: FlatPublicationKey[];
  ATTRIBUTE_LABELS: Record<FlatPublicationKey, string>;

  STORE: {
    useValue(): StoredPublication;
    useSet(): SetterOrUpdater<StoredPublication>;
    useReset(): Resetter;
  };

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
};

export type { FlatPublication, FlatPublicationKey, FlatPublicationEntry };
export { Publication };
