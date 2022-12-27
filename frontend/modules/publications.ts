import {
  atom,
  atomFamily,
  Resetter,
  SetterOrUpdater,
  Snapshot,
  useRecoilCallback,
  useRecoilSnapshot,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { isString } from "lodash";

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
type PublicationEntry = {
  id: number;
  publication: Publication;
  errors: PublicationError;
};
type PublicationId = PublicationEntry["id"];

const PUBLICATION_IDS = atom<PublicationId[]>({
  key: "publication-ids",
  default: [],
});

const PUBLICATIONS = atomFamily<PublicationEntry, PublicationId>({
  key: "publications",
  default: undefined,
});

const DELETED_PUBLICATIONS = atomFamily<boolean, PublicationId>({
  key: "deleted-publications",
  default: false,
});

const DEFAULT_ATTRIBUTE_VISIBILITY: Record<PublicationKey, boolean> = {
  title: true,
  country: false,
  year: true,
  publisher: false,
  authors: true,
  originalTitle: true,
  originalAuthors: false,
};

const VISIBLE_ATTRIBUTES = atomFamily<boolean, PublicationKey>({
  key: "visible-attributes",
  default: (key) => DEFAULT_ATTRIBUTE_VISIBILITY[key],
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
    useIds(): PublicationId[];
    useDeletedIds(): PublicationId[];
    useValue(id: PublicationId): PublicationEntry;
    useAll(): PublicationEntry[];
    useSet(id: PublicationId): SetterOrUpdater<PublicationEntry>;
    useSetAll(): (ids: PublicationId[], entries: PublicationEntry[]) => void;
    useSetDeleted(): (ids: PublicationId[], isDeleted?: boolean) => void;
    useResetAll(): Resetter;

    from: (snapshot: Snapshot) => {
      getIds(): PublicationId[];
      getDeletedIds(): PublicationId[];
      getAll(): PublicationEntry[];
      getValue(id: PublicationId): PublicationEntry;
      isDeleted(id: PublicationId): boolean;
    };

    ATTRIBUTES: {
      useAllVisible(): PublicationKey[];
      useSetVisible(): (key: PublicationKey, isVisible?: boolean) => void;
      useIsVisible(key: PublicationKey): boolean;

      from: (snapshot: Snapshot) => {
        getAllVisible(): PublicationKey[];
        isVisible(key: PublicationKey): boolean;
      };
    };
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
    useIds() {
      return useRecoilValue(PUBLICATION_IDS);
    },
    useDeletedIds() {
      const snapshot = useRecoilSnapshot();
      return this.from(snapshot).getDeletedIds();
    },
    useValue(id: PublicationId) {
      return useRecoilValue(PUBLICATIONS(id));
    },
    useAll() {
      const snapshot = useRecoilSnapshot();
      return this.from(snapshot).getAll();
    },
    useSet(id: PublicationId) {
      return useSetRecoilState(PUBLICATIONS(id));
    },
    useSetAll() {
      return useRecoilCallback(
        ({ set }) =>
          (ids, entries) => {
            set(PUBLICATION_IDS, ids);
            ids.forEach((id, index) => set(PUBLICATIONS(id), entries[index]));
          },
        []
      );
    },
    useSetDeleted() {
      return useRecoilCallback(
        ({ set }) =>
          (ids, isDeleted = true) => {
            ids.forEach((id) => set(DELETED_PUBLICATIONS(id), isDeleted));
          },
        []
      );
    },
    useResetAll() {
      return useRecoilCallback(
        ({ reset, snapshot }) =>
          () => {
            const ids = snapshot.getLoadable(PUBLICATION_IDS).valueOrThrow();
            ids.forEach((id) => {
              reset(PUBLICATIONS(id));
              reset(DELETED_PUBLICATIONS(id));
            });
            reset(PUBLICATION_IDS);
          },
        []
      );
    },

    from: (snapshot) => ({
      getIds() {
        return snapshot.getLoadable(PUBLICATION_IDS).valueOrThrow();
      },
      getDeletedIds() {
        const { getIds, isDeleted } = Publication.STORE.from(snapshot);
        return getIds().filter(isDeleted);
      },
      getValue(id) {
        return snapshot.getLoadable(PUBLICATIONS(id)).valueOrThrow();
      },
      getAll() {
        const { getIds, getValue, isDeleted } =
          Publication.STORE.from(snapshot);

        return getIds()
          .filter((id) => !isDeleted(id))
          .map(getValue);
      },
      isDeleted(id) {
        return snapshot.getLoadable(DELETED_PUBLICATIONS(id)).valueOrThrow();
      },
    }),

    ATTRIBUTES: {
      useAllVisible() {
        const snapshot = useRecoilSnapshot();
        return this.from(snapshot).getAllVisible();
      },
      useIsVisible(key) {
        return useRecoilValue(VISIBLE_ATTRIBUTES(key));
      },
      useSetVisible() {
        return useRecoilCallback(({ set }) => (key, isVisible = true) => {
          set(VISIBLE_ATTRIBUTES(key), isVisible);
        });
      },

      from: (snapshot) => ({
        getAllVisible() {
          return Publication.ATTRIBUTES.filter(this.isVisible);
        },
        isVisible(key) {
          return snapshot.getLoadable(VISIBLE_ATTRIBUTES(key)).valueOrThrow();
        },
      }),
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

export type {
  PublicationKey,
  PublicationEntry,
  PublicationError,
  PublicationId,
};
export { Publication };
