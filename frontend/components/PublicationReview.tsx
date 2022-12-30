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
  HTMLProps,
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
  ColId,
  Column,
  Content,
  Row,
  RowId,
  RowProps,
  SignalColumn,
} from "components/PublicationIndex";
import useReactiveRef from "utils/useReactiveRef";

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

type DataInputProps = Omit<
  HTMLProps<HTMLInputElement>,
  "onChange" | "onBlur"
> & {
  rowId: PublicationId;
  colId: PublicationKey;
  value: string;
  error: string;
  onBlur?: (value: string) => void;
  onExternalChange?: (value: string) => void;
};

const DataInput = forwardRef<HTMLInputElement, DataInputProps>(function (
  { rowId, colId, value: data, onBlur, onExternalChange, ...props },
  ref
) {
  const override = Publication.STORE.ATTRIBUTES.useOverride();

  const [value, setValue] = useReactiveRef(data);

  useEffect(() => {
    if (data !== value.current) setValue(data);
    onExternalChange?.(value.current);
  }, [data, rowId, setValue, onExternalChange]);

  const handleBlur = () => {
    if (data !== value.current) override(rowId, colId, value.current);
    onBlur?.(value.current);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  return (
    <input
      {...props}
      ref={ref}
      placeholder={Publication.ATTRIBUTE_LABELS[colId]}
      className={classNames(
        "px-2 py-1 rounded outline-none bg-transparent focus:bg-white/50 focus:shadow-sm placeholder:text-xs",
        "error:focus:bg-red-400/80 error:bg-red-300/40 error:focus:text-white error:shadow-sm error:placeholder-white"
      )}
      value={value.current}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

const DataInputWithValidation = forwardRef<
  HTMLInputElement,
  {
    rowId: RowId;
    colId: ColId;
    value: string;
    error: string;
  }
>(function (props, ref) {
  const validate = Publication.REMOTE.useValidate();

  const validateIfChanged = (value: string) => {
    if (props.value !== value) {
      validate([props.rowId]);
    }
  };

  return (
    <DataInput
      {...props}
      ref={ref}
      onBlur={validateIfChanged}
      onExternalChange={validateIfChanged}
      data-error={Boolean(props.error)}
    />
  );
});

const AutovalidatedData: typeof Content = ({ rowId, colId, value, error }) => {
  const content = colId === "country" ? COUNTRIES[value] : value;

  return (
    <ErrorTooltip message={error}>
      <DataInputWithValidation
        rowId={rowId}
        colId={colId}
        value={content}
        error={error}
      />
    </ErrorTooltip>
  );
};

const Data: typeof Content = ({ rowId, colId, value, error }) => {
  return <DataInput rowId={rowId} colId={colId} value={value} error={error} />;
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
      ExtendedContent={AutovalidatedData}
      ExtendedSignalColumn={ExtendedSignalColumn}
      ExtraRow={NewPublicationRow}
      onRowClick={toggleSelection}
    />
  );
};

export default PublicationReview;
