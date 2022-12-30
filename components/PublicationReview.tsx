import classNames from "classnames";
import {
  Publication,
  PublicationId,
  PublicationKey,
} from "modules/publications";
import {
  ChangeEventHandler,
  FC,
  forwardRef,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ErrorTooltip from "./ErrorTooltip";
import {
  useIsSelected,
  useIsSelectionEmpty,
  useSelectionEvent,
} from "react-selection-manager";
import PublicationIndex, {
  Column,
  Content,
  Row,
  RowId,
  RowProps,
  SignalColumn,
} from "components/PublicationIndex";

const COUNTRIES: Record<string, string> = {
  BR: "Brazil",
  GB: "Great Britain",
  US: "United States",
  CA: "Canada",
  IE: "Ireland",
  NZ: "New Zealand",
};

const ExtendedColumn: typeof Column = (props) => {
  const { rowId } = props;
  const isSelected = useIsSelected(rowId);
  const isValid = Publication.STORE.useIsValid(rowId);

  return (
    <Column
      {...props}
      invalid={!isValid}
      selected={isSelected}
      selectable={true}
    />
  );
};

const ExtendedSignalColumn: FC<{ rowId: RowId }> = ({ rowId }) => {
  const valid = Publication.STORE.useIsValid(rowId);
  const selected = useIsSelected(rowId);

  return (
    <SignalColumn rowId={rowId} invalid={!valid} selected={selected} selectable>
      {valid ? null : <>❗️</>}
    </SignalColumn>
  );
};

type DataInputProps = {
  rowId: PublicationId;
  colId: PublicationKey;
  value: string;
  error: string;
};

const DataInput = forwardRef<HTMLInputElement, DataInputProps>(
  function DataInput({ rowId, colId, value: data, error }, ref) {
    const override = Publication.STORE.ATTRIBUTES.useOverride();
    const validate = Publication.REMOTE.useValidate();

    const value = useRef<string>(data);
    const [, setKey] = useState(1);

    const setValue = useCallback((v: string) => {
      value.current = v;
      setKey((key) => -key);
    }, []);

    useEffect(() => {
      if (data !== value.current) {
        validate([rowId]);
        setValue(data);
      }
    }, [data, rowId, validate, setValue]);

    const handleBlur = () => {
      if (data !== value.current) {
        override(rowId, colId, value.current);
        validate([rowId]);
      }
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setValue(e.target.value);
    };

    return (
      <input
        ref={ref}
        className={classNames(
          "px-2 py-1 rounded outline-none bg-transparent focus:bg-white/50 focus:shadow-sm placeholder:text-xs",
          "error:focus:bg-red-400/80 error:bg-red-300/40 error:focus:text-white error:shadow-sm error:placeholder-white"
        )}
        value={value.current}
        onChange={handleChange}
        onBlur={handleBlur}
        data-error={Boolean(error)}
        placeholder={Publication.ATTRIBUTE_LABELS[colId]}
      />
    );
  }
);

const Data: typeof Content = ({ rowId, colId, value, error }) => {
  const content = colId === "country" ? COUNTRIES[value] : value;

  return (
    <ErrorTooltip message={error}>
      <DataInput rowId={rowId} colId={colId} value={content} error={error} />
    </ErrorTooltip>
  );
};

const ExtendedRow: FC<RowProps> = (props) => {
  const { rowId } = props;
  const { useErrorDescription } = Publication.STORE;

  const error = useErrorDescription(rowId);

  return (
    <ErrorTooltip
      message={error}
      placement="top-start"
      boundary="main"
      portalRoot="main"
      absoluteCenter
    >
      <Row {...props} />
    </ErrorTooltip>
  );
};

const NewPublicationSignalColumn: FC<{ rowId: RowId }> = ({ rowId }) => {
  return <SignalColumn rowId={rowId}>➕</SignalColumn>;
};

const NewPublicationRow: FC = () => {
  return (
    <Row
      rowId={Publication.NEW_ROW_ID}
      Column={Column}
      Content={Data}
      SignalColumn={NewPublicationSignalColumn}
    />
  );
};

const PublicationReview: FC = () => {
  const ids = Publication.STORE.useVisibleIds();
  const onSelect = useSelectionEvent();
  const isSelectionEmpty = useIsSelectionEmpty();

  const toggleSelection = (id: number) => (event: MouseEvent) =>
    onSelect({
      id,
      type: "publication",
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      orderedIds: ids,
    });

  return (
    <PublicationIndex
      className={classNames(!isSelectionEmpty && "select-none")}
      ExtendedRow={ExtendedRow}
      ExtendedColumn={ExtendedColumn}
      ExtendedContent={Data}
      ExtendedSignalColumn={ExtendedSignalColumn}
      ExtraRow={NewPublicationRow}
      onRowClick={toggleSelection}
    />
  );
};

export default PublicationReview;
