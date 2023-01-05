import classNames from "classnames";
import { times } from "lodash";
import {
  Publication,
  PublicationId,
  PublicationKey,
} from "modules/publications";
import { FC, forwardRef, HTMLProps, MouseEvent, ReactNode } from "react";

type RowId = PublicationId;
type ColId = PublicationKey;

type HTMLTableRowProps = HTMLProps<HTMLTableRowElement>;

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
  value: string;
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
      className="px-2 py-1 w-80 justify group-hover:bg-indigo-100 error:group-hover:bg-red-100 selected:bg-amber-100"
      data-selected={selected}
      data-selectable={selectable}
      data-error={invalid}
    >
      <Content rowId={rowId} colId={colId} value={value} error={error} />
    </td>
  ) : null;
};

type RowProps = Omit<HTMLTableRowProps, "ref"> & {
  rowId: RowId;
  Column: typeof Column;
  Content: typeof Content;
  SignalColumn?: typeof SignalColumn;
  onClick?: (event: MouseEvent) => void;
};

const Row = forwardRef<HTMLTableRowElement, RowProps>(function Row(
  { rowId, Column, Content, SignalColumn, className, onClick, ...props },
  ref
) {
  const clickable = Boolean(onClick);
  return (
    <tr
      ref={ref}
      className={classNames(className, "relative group", {
        "cursor-pointer": clickable,
      })}
      onClick={onClick}
      {...props}
    >
      {SignalColumn && <SignalColumn rowId={rowId} />}
      {Publication.ATTRIBUTES.map((attribute) => (
        <Column
          key={attribute}
          colId={attribute}
          rowId={rowId}
          Content={Content}
        />
      ))}
    </tr>
  );
});

const SignalColumn: FC<{
  rowId: RowId;
  invalid?: boolean;
  selected?: boolean;
  selectable?: boolean;
  children?: ReactNode;
}> = ({ invalid = false, selected = false, selectable = false, children }) => {
  return (
    <td
      className="sticky left-0 px-2 text-xl text-center bg-gray-100 grow group-hover:bg-indigo-100 error:group-hover:bg-red-100 selected:bg-amber-100"
      data-selected={selected}
      data-selectable={selectable}
      data-error={invalid}
    >
      {children}
    </td>
  );
};

type Props = {
  ExtendedRow?: FC<RowProps>;
  ExtendedColumn?: typeof Column;
  ExtendedContent?: typeof Content;
  ExtendedSignalColumn?: typeof SignalColumn;
  ExtraRow?: FC;

  onRowClick?: (id: RowId) => (event: MouseEvent) => void;
  className?: string;
};

const PublicationIndex: FC<Props> = ({
  ExtendedRow = Row,
  ExtendedColumn = Column,
  ExtendedContent = Content,
  ExtendedSignalColumn,
  ExtraRow,
  onRowClick,
  className,
}) => {
  const ids = Publication.STORE.useVisibleIds();

  return ids ? (
    <table className={classNames(className, "overflow-auto h-fit")}>
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
            rowId={id}
            Column={ExtendedColumn}
            SignalColumn={ExtendedSignalColumn}
            Content={ExtendedContent}
            onClick={onRowClick?.(id)}
          />
        ))}
        {ExtraRow && <ExtraRow />}
      </tbody>
    </table>
  ) : (
    <ul
      className="w-full space-y-2 animate-pulse"
      aria-label="Loading"
      role="presentation"
    >
      {times(12, (index) => (
        <li
          key={index}
          className="w-full h-8 bg-gray-200 rounded hover:bg-indigo-100"
          style={{ opacity: index > 7 ? 1 - (2 * (index - 6)) / 12 : 1 }}
        />
      ))}
    </ul>
  );
};

export default PublicationIndex;
export type { RowId, RowProps, ColId };
export { Row, Column, Content, SignalColumn };
