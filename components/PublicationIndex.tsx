import classNames from "classnames";
import {
  Publication,
  PublicationError,
  PublicationId,
  PublicationKey,
} from "modules/publications";
import { FC, MouseEvent, MouseEventHandler, PropsWithChildren } from "react";
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

type RowProps = {
  id: PublicationId;
  publication: Publication;
  errors: PublicationError;
  editable: boolean;
  onClick?: MouseEventHandler;
};

const Column: FC<
  PropsWithChildren & { className?: string; publicationId: PublicationId }
> = ({ className, children, publicationId }) => {
  const isSelected = useIsSelected(publicationId);
  const isValid = Publication.STORE.useIsValid(publicationId);

  return (
    <td
      className={classNames(
        className,
        "max-w-xs px-2 py-1 truncate justify",
        isValid ? "group-hover:bg-indigo-100" : "group-hover:bg-red-100",
        { "bg-amber-100": isSelected }
      )}
    >
      {children}
    </td>
  );
};

const SignalColumn: FC<{ publicationId: PublicationId }> = ({
  publicationId,
}) => {
  const isValid = Publication.STORE.useIsValid(publicationId);

  return (
    <Column
      className="sticky left-0 px-2 text-xl bg-gray-100"
      publicationId={publicationId}
    >
      {!isValid && "❗️"}
    </Column>
  );
};

const DataColumn: FC<{
  attribute: PublicationKey;
  publicationId: PublicationId;
}> = ({ attribute, publicationId }) => {
  const { useIsVisible, useValue, useError } = Publication.STORE.ATTRIBUTES;

  const value = useValue(publicationId, attribute);
  const error = useError(publicationId, attribute);
  const isVisible = useIsVisible(attribute);

  return isVisible ? (
    <Column publicationId={publicationId}>
      <ErrorTooltip message={error} hidden={!Boolean(error)}>
        <div
          className={classNames(
            "px-2 py-1 truncate",
            error &&
              "border rounded border-dotted border-red-300 hover:bg-red-300 hover:text-white "
          )}
        >
          {attribute === "country" ? COUNTRIES[value] : value}
        </div>
      </ErrorTooltip>
    </Column>
  ) : null;
};

const Row: FC<RowProps> = ({ id, publication, editable, errors, onClick }) => {
  const hasErrors = Publication.STORE.useIsValid(id);
  const errorString = Publication.describe(errors);

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
        {editable && <SignalColumn publicationId={id} />}
        {Publication.ATTRIBUTES.map((attribute) => (
          <DataColumn
            key={attribute}
            attribute={attribute}
            publicationId={id}
          />
        ))}
      </tr>
    </ErrorTooltip>
  );
};

const ColumnHeader: FC<{ attribute: PublicationKey }> = ({ attribute }) => {
  const isVisible = Publication.STORE.ATTRIBUTES.useIsVisible(attribute);

  return isVisible ? (
    <th className="px-2 py-4">{Publication.ATTRIBUTE_LABELS[attribute]}</th>
  ) : null;
};

type Props = {
  editable?: boolean;
};

const PublicationIndex: FC<Props> = ({ editable = false }) => {
  const entries = Publication.STORE.useAll();

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
          {Publication.ATTRIBUTES.map((key) => (
            <ColumnHeader key={key} attribute={key} />
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <Row
            key={JSON.stringify(entry)}
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
