import {
  atom,
  atomFamily,
  CallbackInterface,
  MutableSnapshot,
  Resetter,
  selector,
  selectorFamily,
  Snapshot,
  useRecoilCallback,
  useRecoilValue,
} from "recoil";
import { isString, range } from "lodash";
import { request } from "app";
import { _NOTIFICATIONS, _notify } from "components/Notifications";
import { AxiosInstance } from "axios";
import hash from "object-hash";
import useDebounce from "utils/useDebounce";
import { Author } from "./authors";
import { COUNTRIES, Country } from "./country";

type Publication = {
  title: string;
  country: string;
  year: string;
  publisher: string;
  authors: string;
  originalTitle: string;
  originalAuthors: string;
};

type ValidationResult = { publication: Publication; errors: PublicationError };
type PublicationKey = keyof Publication;
type PublicationError = null | string | Record<PublicationKey, string>;
type PublicationEntry = ValidationResult & { id: number };
type PublicationId = number;

const PUBLICATION_IDS = atom<PublicationId[] | undefined>({
  key: "publication-ids",
  default: undefined,
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

const OVERRIDDEN_PUBLICATION_IDS = selector<PublicationId[] | undefined>({
  key: "overridden-publications-ids",
  get({ get }) {
    return get(VISIBLE_PUBLICATION_IDS)?.filter((id) =>
      get(PUBLICATION_OVERRIDES(id))
    );
  },
});

const OVERRIDDEN_PUBLICATION_COUNT = selector<number>({
  key: "overriden-publication-count",
  get({ get }) {
    return get(OVERRIDDEN_PUBLICATION_IDS)?.length || 0;
  },
});

const PUBLICATION_ERROR_DESCRIPTION = selectorFamily<string, PublicationId>({
  key: "publication-error-description",
  get(id) {
    return function ({ get }) {
      return Publication.describeError(get(PUBLICATION_ERRORS(id)));
    };
  },
});

const IS_PUBLICATION_DELETED = atomFamily<boolean, PublicationId>({
  key: "is-publication-deleted",
  default: false,
});

const DELETED_PUBLICATIONS_IDS = selector<PublicationId[] | undefined>({
  key: "deleted-publications-ids",
  get({ get }) {
    return get(PUBLICATION_IDS)?.filter((id) =>
      get(IS_PUBLICATION_DELETED(id))
    );
  },
});

const DELETED_PUBLICATION_COUNT = selector<number>({
  key: "deleted-publication-count",
  get({ get }) {
    return get(DELETED_PUBLICATIONS_IDS)?.length || 0;
  },
});

const VISIBLE_PUBLICATION_IDS = selector<PublicationId[] | undefined>({
  key: "visible-publications-ids",
  get({ get }) {
    return get(PUBLICATION_IDS)?.filter(
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
    return get(VISIBLE_PUBLICATION_IDS)?.length || 0;
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

const VALID_PUBLICATIONS_IDS = selector<PublicationId[] | undefined>({
  key: "valid-publication-ids",
  get({ get }) {
    return get(PUBLICATION_IDS)
      ?.filter((id) => !get(IS_PUBLICATION_DELETED(id)))
      .filter((id) => get(IS_PUBLICATION_VALID(id)));
  },
});

const VALID_PUBLICATION_COUNT = selector<number>({
  key: "valid-publication-count",
  get({ get }) {
    return get(VALID_PUBLICATIONS_IDS)?.length || 0;
  },
});

const LAST_VALIDATED_VALUE = atomFamily<string, PublicationId>({
  key: "last-validated-value",
  default: undefined,
});

const IS_VALIDATING = atom<boolean>({
  key: "is-validating",
  default: false,
});

const TOTAL_PUBLICATION_COUNT = selector<number>({
  key: "total-publication-count",
  get({ get }) {
    return get(PUBLICATION_IDS)?.length || 0;
  },
});

const DEFAULT_ATTRIBUTE_VISIBILITY: Record<PublicationKey, boolean> = {
  title: true,
  country: true,
  year: true,
  publisher: true,
  authors: true,
  originalTitle: true,
  originalAuthors: true,
};

const IS_ATTRIBUTE_VISIBLE = atomFamily<boolean, PublicationKey>({
  key: "is-attributes-visible",
  default: (key) => DEFAULT_ATTRIBUTE_VISIBILITY[key],
});

const VISIBLE_ATTRIBUTES = selector<PublicationKey[]>({
  key: "visible-attributes",
  get({ get }) {
    return Publication.ATTRIBUTES.filter((key) =>
      get(IS_ATTRIBUTE_VISIBLE(key))
    );
  },
});

const KEYWORDS = atom<string[] | undefined>({
  key: "keywords",
  default: undefined,
});

type CompositeAttributeId = `${PublicationId}.${PublicationKey}`;

const PUBLICATION_ATTRIBUTE = selectorFamily<string, CompositeAttributeId>({
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
      return Publication.describeError(
        get(PUBLICATION_ERRORS(parseInt(id))),
        key
      );
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

type PublicationKeyType = "array" | "text" | "enum" | "number";

interface PublicationModule {
  ATTRIBUTES: PublicationKey[];
  ATTRIBUTE_LABELS: Record<PublicationKey, string>;
  ATTRIBUTE_TYPES: Record<PublicationKey, PublicationKeyType>;
  NEW_ROW_ID: PublicationId;

  STORE: {
    initialize(snapshot: MutableSnapshot): void;

    useVisibleIds(): PublicationId[] | undefined;
    useValue(id: PublicationId): Publication;
    useError(id: PublicationId): PublicationError;
    useErrorDescription(id: PublicationId): string;
    useSetAll(): (entries: PublicationEntry[]) => void;
    useSetDeleted(): (ids: PublicationId[], isDeleted?: boolean) => void;
    useResetAll(): Resetter;
    useResetDeleted(): Resetter;
    useResetOverridden(): Resetter;
    useOverriddenIds(): PublicationId[] | undefined;
    useOverrideValue(id: PublicationId): Partial<Publication>;
    useAddNew(): () => PublicationId;

    useIsValid(id: PublicationId): boolean;

    useVisibleCount(): number;
    useValidCount(): number;
    useDeletedCount(): number;
    useOverriddenCount(): number;
    useTotalCount(): number;

    useIsValidating(): boolean;

    useKeywords(): string[] | undefined;

    from: (snapshot: Snapshot) => {
      getVisibleIds(): PublicationId[] | undefined;
      getAllVisible(): Publication[] | undefined;
      getValue(id: PublicationId): Publication;
      isDeleted(id: PublicationId): boolean;
    };

    with: (params: Pick<CallbackInterface, "set">) => {
      setPublications(entries: PublicationEntry[]): void;
      setErrors(entries: PublicationEntry[]): void;
    };

    ATTRIBUTES: {
      useVisible(): PublicationKey[];
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
        value: string
      ) => void;
      useErrorDescription(id: PublicationId, key: PublicationKey): string;
    };
  };

  REMOTE: {
    request: typeof request;
    useRequest<T = void, P = void>(
      factory: (
        params: Pick<CallbackInterface, "set" | "reset" | "snapshot">,
        http: AxiosInstance
      ) => (args: P) => Promise<T>
    ): (args: P) => Promise<T>;

    useIndex(): ({ search }: { search?: string }) => Promise<void>;
    useBulk(): () => Promise<Publication[]>;
    useValidate(): (ids: PublicationId[]) => Promise<void>;
  };

  autocomplete(value: string, attribute: "country"): Promise<Country[]>;
  autocomplete(value: string, attribute: "originalAuthors"): Promise<Author[]>;
  autocomplete(value: string, attribute: "authors"): Promise<Author[]>;
  autocomplete(value: string, attribute: string): Promise<[]>;

  describeValue(value: string, attribute: PublicationKey): string;
  describeError(error: PublicationError, scope?: PublicationKey): string;
  empty(): Publication;
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

  ATTRIBUTE_TYPES: {
    authors: "array",
    originalAuthors: "array",
    originalTitle: "text",
    country: "enum",
    publisher: "text",
    title: "text",
    year: "number",
  },
  NEW_ROW_ID: -1,
  STORE: {
    initialize(snapshot) {
      snapshot.set(PUBLICATIONS(Publication.NEW_ROW_ID), Publication.empty());
    },

    useVisibleIds() {
      return useRecoilValue(VISIBLE_PUBLICATION_IDS);
    },
    useValue(id) {
      return useRecoilValue(VISIBLE_PUBLICATIONS(id));
    },
    useError(id) {
      return useRecoilValue(PUBLICATION_ERRORS(id));
    },

    useAddNew() {
      return useRecoilCallback(({ set, reset, snapshot }) => () => {
        const ids = snapshot.getLoadable(PUBLICATION_IDS).valueOrThrow();

        if (!ids) throw "Can not add new publications: entries not loaded.";

        const id = ids.length;
        const p = snapshot
          .getLoadable(VISIBLE_PUBLICATIONS(Publication.NEW_ROW_ID))
          .valueOrThrow();

        set(PUBLICATION_IDS, [...ids, id]);
        set(PUBLICATIONS(id), p);

        reset(PUBLICATION_OVERRIDES(Publication.NEW_ROW_ID));
        return id;
      });
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
            ids?.forEach((id) => {
              reset(PUBLICATIONS(id));
              reset(PUBLICATION_OVERRIDES(id));
              reset(PUBLICATION_ERRORS(id));
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
              ?.forEach((id) => {
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
              ?.forEach((id) => {
                reset(PUBLICATION_OVERRIDES(id));
              });
          },
        []
      );
    },
    useOverriddenIds() {
      return useRecoilValue(OVERRIDDEN_PUBLICATION_IDS);
    },
    useOverrideValue(id) {
      return useRecoilValue(PUBLICATION_OVERRIDES(id));
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
    useTotalCount() {
      return useRecoilValue(TOTAL_PUBLICATION_COUNT);
    },

    useIsValidating() {
      return useRecoilValue(IS_VALIDATING);
    },

    useKeywords() {
      return useRecoilValue(KEYWORDS);
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
        return getVisibleIds()?.map(getValue);
      },
      isDeleted(id) {
        return snapshot.getLoadable(IS_PUBLICATION_DELETED(id)).valueOrThrow();
      },
    }),

    with: ({ set }) => ({
      setPublications(entries) {
        const ids = entries.map(({ id }) => id);
        set(PUBLICATION_IDS, ids);
        entries.forEach(({ id, publication }) => {
          set(PUBLICATIONS(id), publication);
        });
      },
      setErrors(entries) {
        entries.forEach(({ id, errors }) => {
          set(PUBLICATION_ERRORS(id), errors);
        });
      },
    }),

    ATTRIBUTES: {
      useVisible() {
        return useRecoilValue(VISIBLE_ATTRIBUTES);
      },

      useIsVisible(key) {
        return useRecoilValue(IS_ATTRIBUTE_VISIBLE(key));
      },
      useSetVisible() {
        return useRecoilCallback(
          ({ set }) =>
            (keys, isVisible = true) => {
              keys.map((key) => set(IS_ATTRIBUTE_VISIBLE(key), isVisible));
            },
          []
        );
      },
      useResetAll() {
        return useRecoilCallback(
          ({ reset }) =>
            () => {
              Publication.ATTRIBUTES.forEach((key) => {
                reset(IS_ATTRIBUTE_VISIBLE(key));
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

  REMOTE: {
    async request(cb) {
      return new Promise(async (resolve, reject) => {
        try {
          resolve(await request(cb));
        } catch (error: any) {
          reject(Publication.describeError(error) || error);
        }
      });
    },

    useRequest(factory) {
      const { request } = Publication.REMOTE;
      return useRecoilCallback(
        ({ set, reset, snapshot }) =>
          (args) => {
            return new Promise(async (resolve, reject) => {
              try {
                const res = await request((http) =>
                  factory({ set, reset, snapshot }, http)(args)
                );
                resolve(res);
              } catch (error: any) {
                set(
                  _NOTIFICATIONS,
                  _notify({ message: error, level: "warning" })
                );
                reject(error);
              }
            });
          },
        []
      );
    },

    useIndex() {
      return useDebounce(
        Publication.REMOTE.useRequest(
          ({ set }, http) =>
            async ({ search = undefined }) => {
              const url = search
                ? `publications?search=${search}`
                : "publications";

              type Result = { entries: Publication[]; keywords?: string[] };

              set(PUBLICATION_IDS, undefined);

              const { data } = await http.get<Result>(url);
              const { entries, keywords } = data;

              set(KEYWORDS, keywords);
              set(PUBLICATION_IDS, range(entries.length));
              entries.forEach((publication, index) =>
                set(PUBLICATIONS(index), publication)
              );
            }
        ),
        350
      );
    },
    useBulk() {
      return Publication.REMOTE.useRequest(
        ({ reset, snapshot }, http) =>
          async function () {
            const publications =
              Publication.STORE.from(snapshot).getAllVisible();

            reset(PUBLICATION_IDS);

            const { data } = await http.post<Publication[]>(
              "publications/bulk",
              publications
            );
            return data;
          }
      );
    },
    useValidate() {
      return Publication.REMOTE.useRequest(
        ({ set, snapshot }, http) =>
          async (ids: PublicationId[]) => {
            set(IS_VALIDATING, true);
            const publications = ids
              .map((id) => ({
                id,
                publication: snapshot
                  .getLoadable(VISIBLE_PUBLICATIONS(id))
                  .valueOrThrow(),
              }))
              .map(({ id, publication }) => ({
                id,
                publication,
                hash: hash(publication),
              }))
              .filter(({ id, hash }) => {
                const lastValidatedValue = snapshot
                  .getLoadable(LAST_VALIDATED_VALUE(id))
                  .valueOrThrow();
                return hash !== lastValidatedValue;
              })
              .map(({ id, publication, hash }) => {
                set(LAST_VALIDATED_VALUE(id), hash);
                return publication;
              });

            if (publications.length > 0) {
              const { data } = await http.post<ValidationResult[]>(
                "publications/validate",
                publications
              );

              Publication.STORE.with({ set }).setErrors(
                data.map((entry, index) => ({ ...entry, id: ids[index] }))
              );
            }
            set(IS_VALIDATING, false);
          }
      );
    },
  },

  async autocomplete(value, attribute): Promise<any> {
    switch (attribute) {
      case "authors":
      case "originalAuthors":
        return Author.REMOTE.search(value);
      case "country":
        const countries = Object.values(COUNTRIES);
        return new Promise<Country[]>((resolve) => resolve(countries));
      default:
        return new Promise<Country[]>((resolve) => resolve([]));
    }
  },

  describeValue(value, attribute) {
    if (attribute === "country") {
      const country = COUNTRIES[value];
      if (country) {
        return COUNTRIES[value].label;
      } else {
        console.warn("Unknown country code: ", value);
        return value;
      }
    }
    return value;
  },

  describeError(error, scope) {
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

  empty() {
    return {
      authors: "",
      country: "",
      originalAuthors: "",
      originalTitle: "",
      publisher: "",
      title: "",
      year: "",
    };
  },
};

export type {
  PublicationKey,
  PublicationKeyType,
  PublicationEntry,
  PublicationError,
  PublicationId,
  ValidationResult,
};
export { Publication, COUNTRIES };
