import {
  atom,
  atomFamily,
  Resetter,
  selector,
  selectorFamily,
  SetterOrUpdater,
  Snapshot,
  useRecoilCallback,
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

const PUBLICATIONS_LIST = selector<PublicationEntry[]>({
  key: "publications-as-list",
  get({ get }) {
    return get(PUBLICATION_IDS)
      .filter((id) => !get(DELETED_PUBLICATIONS(id)))
      .map((id) => get(PUBLICATIONS(id)));
  },
});

const PUBLICATION_ERROR = selectorFamily<string, PublicationId>({
  key: "publication-error",
  get(id) {
    return function ({ get }) {
      return Publication.describe(get(PUBLICATIONS(id)).errors);
    };
  },
});

const PUBLICATION_COUNT = selector<number>({
  key: "publication-count",
  get({ get }) {
    return get(PUBLICATION_IDS).length;
  },
});

const DELETED_PUBLICATIONS = atomFamily<boolean, PublicationId>({
  key: "deleted-publications",
  default: false,
});

const DELETED_PUBLICATIONS_LIST = selector<PublicationId[]>({
  key: "deleted-publications-as-list",
  get({ get }) {
    return get(PUBLICATION_IDS).filter((id) => get(DELETED_PUBLICATIONS(id)));
  },
});

const DELETED_PUBLICATION_COUNT = selector<number>({
  key: "deleted-publication-count",
  get({ get }) {
    return get(DELETED_PUBLICATIONS_LIST).length;
  },
});

const VISIBLE_PUBLICATION_IDS = selector<PublicationId[]>({
  key: "visible-publications-as-list",
  get({ get }) {
    return get(PUBLICATION_IDS).filter((id) => !get(DELETED_PUBLICATIONS(id)));
  },
});

const VALID_PUBLICATIONS = selectorFamily<boolean, PublicationId>({
  key: "valid-publications",
  get(id) {
    return function ({ get }) {
      return !Boolean(get(PUBLICATIONS(id)).errors);
    };
  },
});

const VALID_PUBLICATIONS_LIST = selector<number[]>({
  key: "valid-publication-as-list",
  get({ get }) {
    return get(PUBLICATION_IDS)
      .filter((id) => !get(DELETED_PUBLICATIONS(id)))
      .filter((id) => get(VALID_PUBLICATIONS(id)));
  },
});

const VALID_PUBLICATION_COUNT = selector<number>({
  key: "valid-publication-count",
  get({ get }) {
    return get(VALID_PUBLICATIONS_LIST).length;
  },
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

const VISIBLE_ATTRIBUTES_LIST = selector<PublicationKey[]>({
  key: "visible-attributes-as-list",
  get({ get }) {
    return Publication.ATTRIBUTES.filter((key) => get(VISIBLE_ATTRIBUTES(key)));
  },
});

type CompositeAttributeId = `${PublicationId}.${PublicationKey}`;

const PUBLICATION_ATTRIBUTE = selectorFamily<
  string | number,
  CompositeAttributeId
>({
  key: "publication-attribute",
  get(compositeId) {
    return function ({ get }) {
      const [id, key] = compositeId.split(".") as [string, PublicationKey];
      return get(PUBLICATIONS(parseInt(id))).publication[key];
    };
  },
});

const PUBLICATION_ATTRIBUTE_ERROR = selectorFamily<
  string,
  CompositeAttributeId
>({
  key: "publication-error",
  get(compositeId) {
    return function ({ get }) {
      const [id, key] = compositeId.split(".") as [string, PublicationKey];
      return Publication.describe(get(PUBLICATIONS(parseInt(id))).errors, key);
    };
  },
});

const ERROR_MESSAGES: Record<string, string> = {
  conflict: "A publication with this data already exists",
  required: "This field is required and cannot be blank",
  integer: "This field should be an integer",
  incorrect_row_length: "Expected a different number of columns in csv",
  invalid_format: "Could not parse publications from the provided file",
};
interface PublicationModule {
  ATTRIBUTES: PublicationKey[];
  ATTRIBUTE_LABELS: Record<PublicationKey, string>;

  STORE: {
    useIds(): PublicationId[];
    useVisibleIds(): PublicationId[];
    useDeletedIds(): PublicationId[];
    useValue(id: PublicationId): PublicationEntry;
    useError(id: PublicationId): string;
    useAll(): PublicationEntry[];
    useSet(id: PublicationId): SetterOrUpdater<PublicationEntry>;
    useSetAll(): (ids: PublicationId[], entries: PublicationEntry[]) => void;
    useSetDeleted(): (ids: PublicationId[], isDeleted?: boolean) => void;
    useResetAll(): Resetter;
    useResetDeleted(): Resetter;
    useIsValid(id: PublicationId): boolean;

    useCount(): number;
    useValidCount(): number;
    useDeletedCount(): number;

    from: (snapshot: Snapshot) => {
      getIds(): PublicationId[];
      getDeletedIds(): PublicationId[];
      getAll(): PublicationEntry[];
      getValue(id: PublicationId): PublicationEntry;
      isDeleted(id: PublicationId): boolean;
    };

    ATTRIBUTES: {
      useAllVisible(): PublicationKey[];
      useSetVisible(): (keys: PublicationKey[], isVisible?: boolean) => void;
      useIsVisible(key: PublicationKey): boolean;
      useResetAll(): Resetter;
      useValue<K extends PublicationKey>(
        id: PublicationId,
        key: K
      ): Publication[K];
      useError(id: PublicationId, key: PublicationKey): string;

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
    useVisibleIds() {
      return useRecoilValue(VISIBLE_PUBLICATION_IDS);
    },
    useDeletedIds() {
      return useRecoilValue(DELETED_PUBLICATIONS_LIST);
    },
    useValue(id) {
      return useRecoilValue(PUBLICATIONS(id));
    },
    useError(id) {
      return useRecoilValue(PUBLICATION_ERROR(id));
    },
    useAll() {
      return useRecoilValue(PUBLICATIONS_LIST);
    },
    useSet(id) {
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
    useResetDeleted() {
      return useRecoilCallback(
        ({ reset, snapshot }) =>
          () => {
            snapshot
              .getLoadable(DELETED_PUBLICATIONS_LIST)
              .valueOrThrow()
              .forEach((id) => {
                reset(DELETED_PUBLICATIONS(id));
              });
          },
        []
      );
    },
    useIsValid(id) {
      return useRecoilValue(VALID_PUBLICATIONS(id));
    },

    useCount() {
      return useRecoilValue(PUBLICATION_COUNT);
    },

    useDeletedCount() {
      return useRecoilValue(DELETED_PUBLICATION_COUNT);
    },

    useValidCount() {
      return useRecoilValue(VALID_PUBLICATION_COUNT);
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
        return useRecoilValue(VISIBLE_ATTRIBUTES_LIST);
      },
      useIsVisible(key) {
        return useRecoilValue(VISIBLE_ATTRIBUTES(key));
      },
      useSetVisible() {
        return useRecoilCallback(({ set }) => (keys, isVisible = true) => {
          keys.map((key) => set(VISIBLE_ATTRIBUTES(key), isVisible));
        });
      },
      useResetAll() {
        return useRecoilCallback(
          ({ reset }) =>
            () => {
              Publication.ATTRIBUTES.forEach((key) => {
                reset(VISIBLE_ATTRIBUTES(key));
              });
            },
          []
        );
      },
      useValue<K extends PublicationKey>(id: PublicationId, key: K) {
        const compositeId: CompositeAttributeId = `${id}.${key}`;

        return useRecoilValue(
          PUBLICATION_ATTRIBUTE(compositeId)
        ) as Publication[K];
      },
      useError(id, key) {
        const compositeId: CompositeAttributeId = `${id}.${key}`;
        return useRecoilValue(PUBLICATION_ATTRIBUTE_ERROR(compositeId));
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
