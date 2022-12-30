import {
  atom,
  atomFamily,
  Resetter,
  selector,
  selectorFamily,
  Snapshot,
  useRecoilCallback,
  useRecoilValue,
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
type PublicationId = number;

const PUBLICATION_IDS = atom<PublicationId[]>({
  key: "publication-ids",
  default: [],
});

const PUBLICATIONS = atomFamily<Publication, PublicationId>({
  key: "publications",
  default: undefined,
});

const PUBLICATION_ERRORS = atomFamily<PublicationError, PublicationId>({
  key: "publication-error",
  default: null,
});

const PUBLICATION_OVERRIDES = atomFamily<Partial<Publication>, PublicationId>({
  key: "publication-overrides",
  default: undefined,
});

const OVERRIDDEN_PUBLICATION_COUNT = selector<number>({
  key: "overriden-publication-count",
  get({ get }) {
    return get(VISIBLE_PUBLICATION_IDS).map(PUBLICATION_OVERRIDES).filter(get)
      .length;
  },
});

const PUBLICATION_ERROR_DESCRIPTION = selectorFamily<string, PublicationId>({
  key: "publication-error-description",
  get(id) {
    return function ({ get }) {
      return Publication.describe(get(PUBLICATION_ERRORS(id)));
    };
  },
});

const IS_PUBLICATION_DELETED = atomFamily<boolean, PublicationId>({
  key: "is-publication-deleted",
  default: false,
});

const DELETED_PUBLICATIONS_IDS = selector<PublicationId[]>({
  key: "deleted-publications-ids",
  get({ get }) {
    return get(PUBLICATION_IDS).filter((id) => get(IS_PUBLICATION_DELETED(id)));
  },
});

const DELETED_PUBLICATION_COUNT = selector<number>({
  key: "deleted-publication-count",
  get({ get }) {
    return get(DELETED_PUBLICATIONS_IDS).length;
  },
});

const VISIBLE_PUBLICATION_IDS = selector<PublicationId[]>({
  key: "visible-publications-ids",
  get({ get }) {
    return get(PUBLICATION_IDS).filter(
      (id) => !get(IS_PUBLICATION_DELETED(id))
    );
  },
});

const VISIBLE_PUBLICATIONS = selectorFamily<Publication, PublicationId>({
  key: "visible-publications",
  get(id) {
    return function ({ get }) {
      return {
        ...get(PUBLICATIONS(id)),
        ...(get(PUBLICATION_OVERRIDES(id)) || {}),
      };
    };
  },
});

const VISIBLE_PUBLICATION_COUNT = selector<number>({
  key: "publication-count",
  get({ get }) {
    return get(VISIBLE_PUBLICATION_IDS).length;
  },
});

const IS_PUBLICATION_VALID = selectorFamily<boolean, PublicationId>({
  key: "is-publication-valid",
  get(id) {
    return function ({ get }) {
      return !Boolean(get(PUBLICATION_ERRORS(id)));
    };
  },
});

const VALID_PUBLICATIONS_IDS = selector<number[]>({
  key: "valid-publication-ids",
  get({ get }) {
    return get(PUBLICATION_IDS)
      .filter((id) => !get(IS_PUBLICATION_DELETED(id)))
      .filter((id) => get(IS_PUBLICATION_VALID(id)));
  },
});

const VALID_PUBLICATION_COUNT = selector<number>({
  key: "valid-publication-count",
  get({ get }) {
    return get(VALID_PUBLICATIONS_IDS).length;
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

type CompositeAttributeId = `${PublicationId}.${PublicationKey}`;

const PUBLICATION_ATTRIBUTE = selectorFamily<
  string | number,
  CompositeAttributeId
>({
  key: "publication-attribute",
  get(compositeId) {
    return function ({ get }) {
      const [id, key] = compositeId.split(".") as [string, PublicationKey];
      return get(VISIBLE_PUBLICATIONS(parseInt(id)))[key];
    };
  },
});

const PUBLICATION_ATTRIBUTE_ERROR_DESCRIPTION = selectorFamily<
  string,
  CompositeAttributeId
>({
  key: "publication-attribute-error-description",
  get(compositeId) {
    return function ({ get }) {
      const [id, key] = compositeId.split(".") as [string, PublicationKey];
      return Publication.describe(get(PUBLICATION_ERRORS(parseInt(id))), key);
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
    useVisibleIds(): PublicationId[];
    useValue(id: PublicationId): Publication;
    useError(id: PublicationId): PublicationError;
    useErrorDescription(id: PublicationId): string;
    useSetAll(): (entries: PublicationEntry[]) => void;
    useSetDeleted(): (ids: PublicationId[], isDeleted?: boolean) => void;
    useResetAll(): Resetter;
    useResetDeleted(): Resetter;
    useResetOverridden(): Resetter;

    useIsValid(id: PublicationId): boolean;

    useVisibleCount(): number;
    useValidCount(): number;
    useDeletedCount(): number;
    useOverriddenCount(): number;

    from: (snapshot: Snapshot) => {
      getVisibleIds(): PublicationId[];
      getAllVisible(): Publication[];
      getValue(id: PublicationId): Publication;
      isDeleted(id: PublicationId): boolean;
    };

    ATTRIBUTES: {
      useSetVisible(): (keys: PublicationKey[], isVisible?: boolean) => void;
      useIsVisible(key: PublicationKey): boolean;
      useResetAll(): Resetter;
      useValue<K extends PublicationKey>(
        id: PublicationId,
        key: K
      ): Publication[K];
      useOverride(): (
        id: PublicationId,
        attribute: PublicationKey,
        value: string | number
      ) => void;
      useErrorDescription(id: PublicationId, key: PublicationKey): string;
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
    useVisibleIds() {
      return useRecoilValue(VISIBLE_PUBLICATION_IDS);
    },
    useValue(id) {
      return useRecoilValue(VISIBLE_PUBLICATIONS(id));
    },
    useError(id) {
      return useRecoilValue(PUBLICATION_ERRORS(id));
    },
    useErrorDescription(id) {
      return useRecoilValue(PUBLICATION_ERROR_DESCRIPTION(id));
    },
    useSetAll() {
      return useRecoilCallback(
        ({ set }) =>
          (entries) => {
            const ids = entries.map(({ id }) => id);
            set(PUBLICATION_IDS, ids);

            entries.forEach(({ id, publication, errors }) => {
              set(PUBLICATIONS(id), publication);
              set(PUBLICATION_ERRORS(id), errors);
            });
          },
        []
      );
    },
    useSetDeleted() {
      return useRecoilCallback(
        ({ set }) =>
          (ids, isDeleted = true) => {
            ids.forEach((id) => set(IS_PUBLICATION_DELETED(id), isDeleted));
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
              reset(PUBLICATION_OVERRIDES(id));
              reset(IS_PUBLICATION_DELETED(id));
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
              .getLoadable(DELETED_PUBLICATIONS_IDS)
              .valueOrThrow()
              .forEach((id) => {
                reset(IS_PUBLICATION_DELETED(id));
              });
          },
        []
      );
    },

    useResetOverridden() {
      return useRecoilCallback(
        ({ reset, snapshot }) =>
          () => {
            snapshot
              .getLoadable(PUBLICATION_IDS)
              .valueOrThrow()
              .forEach((id) => {
                reset(PUBLICATION_OVERRIDES(id));
              });
          },
        []
      );
    },

    useIsValid(id) {
      return useRecoilValue(IS_PUBLICATION_VALID(id));
    },

    useVisibleCount() {
      return useRecoilValue(VISIBLE_PUBLICATION_COUNT);
    },
    useDeletedCount() {
      return useRecoilValue(DELETED_PUBLICATION_COUNT);
    },
    useValidCount() {
      return useRecoilValue(VALID_PUBLICATION_COUNT);
    },
    useOverriddenCount() {
      return useRecoilValue(OVERRIDDEN_PUBLICATION_COUNT);
    },

    from: (snapshot) => ({
      getVisibleIds() {
        return snapshot.getLoadable(VISIBLE_PUBLICATION_IDS).valueOrThrow();
      },
      getValue(id) {
        return snapshot.getLoadable(VISIBLE_PUBLICATIONS(id)).valueOrThrow();
      },
      getAllVisible() {
        const { getVisibleIds, getValue } = Publication.STORE.from(snapshot);
        return getVisibleIds().map(getValue);
      },
      isDeleted(id) {
        return snapshot.getLoadable(IS_PUBLICATION_DELETED(id)).valueOrThrow();
      },
    }),

    ATTRIBUTES: {
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
      useOverride() {
        return useRecoilCallback(
          ({ set }) =>
            (id, attribute, value) => {
              set(PUBLICATION_OVERRIDES(id), (current) => ({
                ...current,
                [attribute]: value,
              }));
            },
          []
        );
      },

      useErrorDescription(id, key) {
        const compositeId: CompositeAttributeId = `${id}.${key}`;
        return useRecoilValue(
          PUBLICATION_ATTRIBUTE_ERROR_DESCRIPTION(compositeId)
        );
      },
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
