import c from "classnames";
import { times } from "lodash";
import {
  Publication,
  PublicationId,
  PublicationKey,
} from "modules/publication";
import {
  FC,
  forwardRef,
  HTMLProps,
  MouseEvent,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import { mergeRefs } from "react-merge-refs";
import useVisible from "utils/useVisible";

type RowId = PublicationId;
type ColId = PublicationKey;

type HTMLTableRowProps = HTMLProps<HTMLTableRowElement>;

const ColumnHeader: FC<{ colId: ColId }> = ({ colId }) => {
  const isVisible = Publication.STORE.ATTRIBUTES.useIsVisible(colId);

  return isVisible ? (
    <th className={c("px-4 pb-4 text-left", { "w-24": colId === "year" })}>
      {Publication.ATTRIBUTE_LABELS[colId]}
    </th>
  ) : null;
};

const Content: FC<{
  rowId: RowId;
  colId: ColId;
  error: string;
  value: string;
}> = ({ value, colId }) => {
  return (
    <div className="px-2 py-1 truncate">
      {Publication.describeValue(value, colId)}
    </div>
  );
};

const Column: FC<{
  rowId: RowId;
  colId: ColId;
  Content: typeof Content;
  focused?: boolean;
  visible?: boolean;
  invalid?: boolean;
  selected?: boolean;
  selectable?: boolean;
}> = ({
  rowId,
  colId,
  Content,
  focused = false,
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
      className="px-2 py-1 text-sm truncate justify group-hover:bg-indigo-100 error:group-hover:bg-red-100 error:focused:bg-red-100 selected:bg-amber-100"
      data-selected={selected}
      data-selectable={selectable}
      data-error={invalid}
      data-focused={focused}
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

  const innerRef = useRef(null);

  const compositeRef = useMemo(
    () => mergeRefs([ref, innerRef]),
    [ref, innerRef]
  );

  const visible = useVisible(innerRef);

  return (
    <tr
      ref={compositeRef}
      className={c(className, "relative group h-9", {
        "cursor-pointer": clickable,
      })}
      onClick={onClick}
      {...props}
    >
      {visible && (
        <>
          {SignalColumn && <SignalColumn rowId={rowId} />}
          {Publication.ATTRIBUTES.map((attribute) => (
            <Column
              key={attribute}
              colId={attribute}
              rowId={rowId}
              Content={Content}
            />
          ))}
        </>
      )}
    </tr>
  );
});

const SignalColumn: FC<{
  rowId: RowId;
  focused?: boolean;
  invalid?: boolean;
  selected?: boolean;
  selectable?: boolean;
  children?: ReactNode;
}> = ({
  focused = false,
  invalid = false,
  selected = false,
  selectable = false,
  children,
}) => {
  return (
    <td
      className="sticky left-0 flex items-center justify-center h-full px-2 truncate bg-gray-100 group-hover:bg-indigo-100 error:group-hover:bg-red-100 error:focused:bg-red-100 selected:bg-amber-100"
      data-selected={selected}
      data-selectable={selectable}
      data-error={invalid}
      data-focused={focused}
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

  return ids && (ids.length > 0 || ExtraRow) ? (
    <table className={c(className, "h-fit w-full table-fixed")}>
      <thead className="sticky top-0 z-10 bg-gray-100">
        <tr>
          {ExtendedSignalColumn && <th className="w-10" />}
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
  ) : ids ? (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col items-center justify-center pb-32 group">
        <div className="h-56 m-8 border-2 border-gray-300 rounded-2xl aspect-square group-hover:border-indigo-200" />
        <span className="text-xl text-gray-300 group-hover:text-indigo-200">
          No results found, try another query.
        </span>
      </div>
    </div>
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
