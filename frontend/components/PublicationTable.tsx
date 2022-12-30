import classNames from "classnames";
import {
  Publication,
  PublicationId,
  PublicationKey,
} from "modules/publications";
import { FC, MouseEvent, ReactNode } from "react";

type RowId = PublicationId;
type ColId = PublicationKey;

const ColumnHeader: FC<{ colId: ColId }> = ({ colId }) => {
  const isVisible = Publication.STORE.ATTRIBUTES.useIsVisible(colId);

  return isVisible ? (
    <th className="px-2 py-4">{Publication.ATTRIBUTE_LABELS[colId]}</th>
  ) : null;
};

const Content: FC<{
  rowId: RowId;
  colId: ColId;
  error: string;
  value: string | number;
}> = ({ value }) => {
  return <div className="px-2 py-1 truncate">{value}</div>;
};

const Column: FC<{
  rowId: RowId;
  colId: ColId;
  Content: typeof Content;
  visible?: boolean;
  invalid?: boolean;
  selected?: boolean;
  selectable?: boolean;
}> = ({
  rowId,
  colId,
  Content,
  invalid = false,
  selected = false,
  selectable = false,
}) => {
  const { useIsVisible, useValue, useErrorDescription } =
    Publication.STORE.ATTRIBUTES;

  const visible = useIsVisible(colId);
  const value = useValue(rowId, colId);
  const error = useErrorDescription(rowId, colId);

  return visible ? (
    <td
      className="max-w-xs px-2 py-1 justify group-hover:bg-indigo-100 error:group-hover:bg-red-100 selected:bg-amber-100"
      data-selected={selected}
      data-selectable={selectable}
      data-error={invalid}
    >
      <Content rowId={rowId} colId={colId} value={value} error={error} />
    </td>
  ) : null;
};

const Row: FC<{
  id: RowId;
  Column: typeof Column;
  Content: typeof Content;
  SignalColumn?: typeof SignalColumn;
  onClick?: (event: MouseEvent) => void;
}> = ({ id, Column, Content, SignalColumn, onClick }) => {
  const clickable = Boolean(onClick);
  return (
    <tr
      className={classNames("relative group", clickable && "cursor-pointer")}
      onClick={onClick}
    >
      {SignalColumn && <SignalColumn rowId={id} />}
      {Publication.ATTRIBUTES.map((attribute) => (
        <Column
          key={attribute}
          colId={attribute}
          rowId={id}
          Content={Content}
        />
      ))}
    </tr>
  );
};

const SignalColumn: FC<{
  rowId: RowId;
  invalid?: boolean;
  selected?: boolean;
  selectable?: boolean;
  children?: ReactNode;
}> = ({ invalid = false, selected = false, selectable = false, children }) => {
  return (
    <td
      className="sticky left-0 px-2 text-xl bg-gray-100 group-hover:bg-indigo-100 error:group-hover:bg-red-100 selected:bg-amber-100"
      data-selected={selected}
      data-selectable={selectable}
      data-error={invalid}
    >
      {children}
    </td>
  );
};

type Props = {
  ExtendedRow?: typeof Row;
  ExtendedColumn?: typeof Column;
  ExtendedContent?: typeof Content;
  ExtendedSignalColumn?: typeof SignalColumn;

  onRowClick?: (id: RowId) => (event: MouseEvent) => void;
  className?: string;
};

const PublicationTable: FC<Props> = ({
  ExtendedRow = Row,
  ExtendedColumn = Column,
  ExtendedContent = Content,
  ExtendedSignalColumn,
  onRowClick,
  className,
}) => {
  const ids = Publication.STORE.useVisibleIds();

  return (
    <table className={classNames(className, "overflow-auto")}>
      <thead className="sticky top-0 z-10 bg-gray-100">
        <tr>
          {ExtendedSignalColumn && <th />}
          {Publication.ATTRIBUTES.map((key) => (
            <ColumnHeader key={key} colId={key} />
          ))}
        </tr>
      </thead>
      <tbody>
        {ids.map((id) => (
          <ExtendedRow
            key={id}
            id={id}
            Column={ExtendedColumn}
            SignalColumn={ExtendedSignalColumn}
            Content={ExtendedContent}
            onClick={onRowClick?.(id)}
          />
        ))}
      </tbody>
    </table>
  );
};

export default PublicationTable;
export type { RowId };
export { Row, Column, Content, SignalColumn };
