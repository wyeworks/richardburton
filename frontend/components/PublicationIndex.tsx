import classNames from "classnames";
import {
  Publication,
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

type ColumnProps = PropsWithChildren & {
  className?: string;
  publicationId: PublicationId;
};

const Column: FC<ColumnProps> = ({ className, children, publicationId }) => {
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

type SignalColumnProps = {
  publicationId: PublicationId;
};

const SignalColumn: FC<SignalColumnProps> = ({ publicationId }) => {
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

type DataColumnProps = {
  attribute: PublicationKey;
  publicationId: PublicationId;
  editable: boolean;
};

const DataColumn: FC<DataColumnProps> = ({
  attribute,
  publicationId,
  editable,
}) => {
  const { useIsVisible, useValue, useError } = Publication.STORE.ATTRIBUTES;

  const value = useValue(publicationId, attribute);
  const error = useError(publicationId, attribute);
  const isVisible = useIsVisible(attribute);

  return isVisible ? (
    <Column publicationId={publicationId}>
      <ErrorTooltip
        message={error}
        hidden={!Boolean(error)}
        disabled={!editable}
        boundary="main"
      >
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

type RowProps = {
  editable: boolean;
  publicationId: PublicationId;
  onClick?: MouseEventHandler;
};

const Row: FC<RowProps> = ({ publicationId, editable, onClick }) => {
  const { useIsValid, useError } = Publication.STORE;

  const isValid = useIsValid(publicationId);
  const error = useError(publicationId);

  return (
    <ErrorTooltip
      message={error}
      hidden={!Boolean(error)}
      disabled={!editable}
      placement="top-start"
      boundary="main"
      portalRoot="main"
      absoluteCenter
    >
      <tr
        className={classNames(
          "relative group",
          isValid ? "hover:bg-indigo-100" : "hover:bg-red-100",
          { "cursor-pointer": Boolean(onClick) }
        )}
        onClick={onClick}
      >
        {editable && <SignalColumn publicationId={publicationId} />}
        {Publication.ATTRIBUTES.map((attribute) => (
          <DataColumn
            key={attribute}
            attribute={attribute}
            publicationId={publicationId}
            editable={editable}
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
  const ids = Publication.STORE.useVisibleIds();

  const onSelect = useSelectionEvent();

  const toggleSelection = (id: number) => (event: MouseEvent) =>
    onSelect({
      id,
      type: "publication",
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      orderedIds: ids,
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
        {ids.map((id) => (
          <Row
            key={id}
            publicationId={id}
            editable={editable}
            onClick={editable ? toggleSelection(id) : undefined}
          />
        ))}
      </tbody>
    </table>
  );
};

export default PublicationIndex;
