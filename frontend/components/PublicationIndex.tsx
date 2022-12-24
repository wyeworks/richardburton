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
    <Column className="sticky left-0 px-2 bg-gray-100">
      {row.hasErrors && "❗️"}
    </Column>
  );
};

const DataColumn: FC<{ attribute: FlatPublicationKey }> = ({ attribute }) => {
  const row = useRow();

  return (
    <Column>
      {attribute === "country"
        ? COUNTRIES[row.publication[attribute]]
        : row.publication[attribute]}
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
      <tr className="cursor-pointer group">
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
