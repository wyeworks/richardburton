import classNames from "classnames";
import {
  FlatPublication,
  FlatPublicationEntry,
  FlatPublicationKey,
  Publication,
  FlatPublicationError,
} from "modules/publications";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import ErrorTooltip from "./ErrorTooltip";

const COUNTRIES: Record<string, string> = {
  BR: "Brazil",
  GB: "Great Britain",
  US: "United States",
  CA: "Canada",
  IE: "Ireland",
  NZ: "New Zealand",
};

type Props = {
  entries: FlatPublicationEntry[];
  columns: Set<FlatPublicationKey>;
};

type RowProps = {
  attributes: FlatPublicationKey[];
  publication: FlatPublication;
  errors: FlatPublicationError;
};

type RowContext = {
  publication: FlatPublication;
  errors: FlatPublicationError;
  hasErrors: boolean;
};
const RowContext = createContext<RowContext | null>(null);

function useRow(): RowContext {
  const context = useContext(RowContext);
  if (!context) throw "RowContext provider not found";
  return context;
}

const Column: FC<PropsWithChildren & { className?: string }> = ({
  className,
  children,
}) => {
  const row = useRow();

  return (
    <td
      className={classNames(
        className,
        "max-w-xs px-2 py-1 truncate justify",
        row.hasErrors ? "group-hover:bg-red-100" : "group-hover:bg-indigo-100"
      )}
    >
      {children}
    </td>
  );
};

const SignalColumn: FC = () => {
  const row = useRow();

  return (
    <Column className="sticky left-0 px-2 text-xl bg-gray-100">
      {row.hasErrors && "❗️"}
    </Column>
  );
};

const DataColumn: FC<{ attribute: FlatPublicationKey }> = ({ attribute }) => {
  const row = useRow();
  const errorString = Publication.describe(row.errors, attribute);

  return (
    <Column>
      <ErrorTooltip message={errorString} hidden={!Boolean(errorString)}>
        <div
          className={classNames(
            "px-2 py-1 truncate",
            errorString &&
              "border rounded border-dotted border-red-300 hover:bg-red-300 hover:text-white "
          )}
        >
          {attribute === "country"
            ? COUNTRIES[row.publication[attribute]]
            : row.publication[attribute]}
        </div>
      </ErrorTooltip>
    </Column>
  );
};

const Row: FC<RowProps> = ({ attributes, publication, errors }) => {
  const hasErrors = Boolean(errors);
  const errorString = Publication.describe(errors);

  const context = useMemo(
    () => ({ publication, errors, hasErrors }),
    [publication, errors, hasErrors]
  );

  return (
    <ErrorTooltip
      message={errorString}
      hidden={!Boolean(errorString)}
      followCursor="x"
      placement="top-start"
    >
      <tr
        className={classNames(
          "cursor-pointer group",
          hasErrors ? "hover:bg-red-100" : "hover:bg-indigo-100"
        )}
      >
        <RowContext.Provider value={context}>
          <SignalColumn />
          {attributes.map((attribute) => (
            <DataColumn key={attribute} attribute={attribute} />
          ))}
        </RowContext.Provider>
      </tr>
    </ErrorTooltip>
  );
};

const PublicationIndex: FC<Props> = ({ entries, columns }) => {
  const attributes = Publication.ATTRIBUTES.filter((attribute) =>
    columns.has(attribute)
  );

  return (
    <table className="overflow-auto">
      <thead className="sticky top-0 z-10 bg-gray-100">
        <tr>
          <th />
          {attributes.map((key) => (
            <th className="px-2 py-4" key={key}>
              {Publication.ATTRIBUTE_LABELS[key]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <Row key={JSON.stringify(entry)} attributes={attributes} {...entry} />
        ))}
      </tbody>
    </table>
  );
};

export default PublicationIndex;
