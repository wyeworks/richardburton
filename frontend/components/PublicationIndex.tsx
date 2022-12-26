import classNames from "classnames";
import {
  Publication,
  PublicationEntry,
  PublicationError,
  PublicationKey,
} from "modules/publications";
import {
  createContext,
  FC,
  MouseEvent,
  MouseEventHandler,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import ErrorTooltip from "./ErrorTooltip";
import {
  useIsSelected,
  useIsSelectionEmpty,
  useSelectionEvent,
} from "react-selection-manager";

const COUNTRIES: Record<string, string> = {
  BR: "Brazil",
  GB: "Great Britain",
  US: "United States",
  CA: "Canada",
  IE: "Ireland",
  NZ: "New Zealand",
};

type Props = {
  entries: PublicationEntry[];
  columns: Set<PublicationKey>;
  editable?: boolean;
};

type RowProps = {
  id: number;
  attributes: PublicationKey[];
  publication: Publication;
  errors: PublicationError;
  editable: boolean;
  onClick?: MouseEventHandler;
};

type RowContext = {
  id: number;
  publication: Publication;
  errors: PublicationError;
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

  const selected = useIsSelected(row.id);

  return (
    <td
      className={classNames(
        className,
        "max-w-cell px-2 py-1 truncate justify",
        row.hasErrors ? "group-hover:bg-red-100" : "group-hover:bg-indigo-100",
        { "bg-amber-100": selected }
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

const DataColumn: FC<{ attribute: PublicationKey }> = ({ attribute }) => {
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
            ? COUNTRIES[row.publication[attribute]] ||
              row.publication[attribute]
            : row.publication[attribute]}
        </div>
      </ErrorTooltip>
    </Column>
  );
};

const Row: FC<RowProps> = ({
  id,
  attributes,
  publication,
  errors,
  editable,
  onClick,
}) => {
  const hasErrors = Boolean(errors);
  const errorString = Publication.describe(errors);

  const context = useMemo(
    () => ({ id, publication, errors, hasErrors }),
    [id, publication, errors, hasErrors]
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
          "relative group",
          hasErrors ? "hover:bg-red-100" : "hover:bg-indigo-100",
          { "cursor-pointer": Boolean(onClick) }
        )}
        onClick={onClick}
      >
        <RowContext.Provider value={context}>
          {editable && <SignalColumn />}
          {attributes.map((attribute) => (
            <DataColumn key={attribute} attribute={attribute} />
          ))}
        </RowContext.Provider>
      </tr>
    </ErrorTooltip>
  );
};

const PublicationIndex: FC<Props> = ({
  entries,
  columns,
  editable = false,
}) => {
  const attributes = Publication.ATTRIBUTES.filter((attribute) =>
    columns.has(attribute)
  );

  const onSelect = useSelectionEvent();

  const toggleSelection = (id: number) => (event: MouseEvent) =>
    onSelect({
      id,
      type: "publication",
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      orderedIds: entries.map(({ id }) => id),
    });

  const isSelectionEmpty = useIsSelectionEmpty();

  return (
    <table
      className={classNames("overflow-auto", {
        "select-none": !isSelectionEmpty,
      })}
    >
      <thead className="sticky top-0 z-10 bg-gray-100">
        <tr>
          {editable && <th />}
          {attributes.map((key) => (
            <th className="px-2 py-4" key={key}>
              {Publication.ATTRIBUTE_LABELS[key]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <Row
            key={JSON.stringify(entry)}
            attributes={attributes}
            editable={editable}
            onClick={editable ? toggleSelection(entry.id) : undefined}
            {...entry}
          />
        ))}
      </tbody>
    </table>
  );
};

export default PublicationIndex;
