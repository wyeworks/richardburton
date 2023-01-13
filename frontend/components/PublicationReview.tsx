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
  KeyboardEventHandler,
  MouseEvent,
  useCallback,
  useEffect,
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
import AddCircle from "assets/add-circle.svg";
import { Key } from "app";

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

type DataInputProps = Omit<HTMLProps<HTMLInputElement>, "onChange"> & {
  rowId: PublicationId;
  colId: PublicationKey;
  value: string;
  error: string;
};

const DataInput = forwardRef<HTMLInputElement, DataInputProps>(
  function DataInput({ rowId, colId, value: data, ...props }, ref) {
    const override = Publication.STORE.ATTRIBUTES.useOverride();
    const [value, setValue] = useState(data);

    useEffect(() => {
      if (data !== value) {
        setValue(data);
      }
    }, [data, rowId, colId, value, setValue]);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setValue(e.target.value);
      override(rowId, colId, e.target.value);
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
        value={value}
        onChange={handleChange}
      />
    );
  }
);

const DataInputWithValidation = forwardRef<
  HTMLInputElement,
  {
    rowId: RowId;
    colId: ColId;
    value: string;
    error: string;
  }
>(function DataInputWithValidation(props, ref) {
  const validate = Publication.REMOTE.useValidate();

  const doValidate = useCallback(() => {
    validate([props.rowId]);
  }, [props.rowId, validate]);

  return (
    <DataInput
      {...props}
      ref={ref}
      data-error={Boolean(props.error)}
      onBlur={doValidate}
    />
  );
});

const AutovalidatedData: typeof Content = ({ rowId, colId, value, error }) => {
  const content = colId === "country" ? COUNTRIES[value] || value : value;

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

const useSubmit = () => {
  const register = Publication.STORE.useAddNew();
  const validate = Publication.REMOTE.useValidate();

  return useCallback(() => {
    const id = register();
    validate([id]);
  }, [register, validate]);
};

const SubmittingData: typeof Content = ({ rowId, colId, value, error }) => {
  const submit = useSubmit();

  const handleKeyDown: KeyboardEventHandler = useCallback(
    (event) => {
      if (event.key === Key.ENTER) {
        submit();
      }
    },
    [submit]
  );

  return (
    <DataInput
      rowId={rowId}
      colId={colId}
      value={value}
      error={error}
      onKeyDown={handleKeyDown}
    />
  );
};

const NewPublicationSignalColumn: FC<{ rowId: RowId }> = ({ rowId }) => {
  const submit = useSubmit();
  return (
    <SignalColumn rowId={rowId}>
      <button
        className="flex text-indigo-600 rounded-full w-fit h-fit hover:text-indigo-700"
        onClick={submit}
      >
        <AddCircle className="w-7 h-7" />
      </button>
    </SignalColumn>
  );
};

const NewPublicationRow: FC = () => {
  return (
    <Row
      rowId={Publication.NEW_ROW_ID}
      Column={Column}
      Content={SubmittingData}
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
