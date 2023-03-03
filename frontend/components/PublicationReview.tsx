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
  useMemo,
  useState,
} from "react";
import Tooltip from "./Tooltip";
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
import AddCircleIcon from "assets/add-circle.svg";
import { Key } from "app";
import ErrorIcon from "assets/error.svg";
import { Author } from "modules/authors";
import { isElement } from "lodash";
import Multicombobox from "./Multicombobox";

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
      {valid ? null : <ErrorIcon className="text-red-600" />}
    </SignalColumn>
  );
};

type DataInputProps = Omit<HTMLProps<HTMLInputElement>, "onChange"> & {
  rowId: PublicationId;
  colId: PublicationKey;
  value: string;
  error: string;
  onChange?: (value: string) => void;
};

const DataInput = forwardRef<HTMLInputElement, DataInputProps>(
  function DataInput({ rowId, colId, value: data, onChange, ...props }, ref) {
    const override = Publication.STORE.ATTRIBUTES.useOverride();
    const [value, setValue] = useState(data);

    useEffect(() => {
      console.log({ data, value });
      if (data !== value) {
        setValue(data);
      }
    }, [data, rowId, colId, value, setValue]);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setValue(e.target.value);
      override(rowId, colId, e.target.value);
      onChange?.(e.target.value);
    };

    const handleArrayChange = (value: string[]) => {
      const v = value.join(",");
      setValue(v);
      override(rowId, colId, v);
      onChange?.(v);
    };

    const isArray = colId === "authors" || colId === "originalAuthors";

    const items = useMemo(
      () => (value === "" ? [] : value.split(",")),
      [value]
    );

    return isArray ? (
      <Multicombobox
        {...props}
        ref={ref}
        value={items}
        onChange={handleArrayChange}
        placeholder={Publication.ATTRIBUTE_LABELS[colId]}
        getOptions={async (search) => {
          const authors = await Author.REMOTE.search("Richard");

          return authors
            .map(({ name }) => name)
            .filter((name) => name.toLowerCase().startsWith(search));
        }}
      />
    ) : (
      <input
        {...props}
        ref={ref}
        placeholder={Publication.ATTRIBUTE_LABELS[colId]}
        className={classNames(
          "px-2 py-1 rounded outline-none bg-transparent focus:bg-gray-active focus:shadow-sm placeholder:text-xs",
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

  const isArray =
    props.colId === "authors" || props.colId === "originalAuthors";

  return (
    <DataInput
      {...props}
      ref={ref}
      data-error={Boolean(props.error)}
      onBlur={doValidate}
      onChange={isArray ? doValidate : undefined}
    />
  );
});

const AutovalidatedData: typeof Content = ({ rowId, colId, value, error }) => {
  const content = colId === "country" ? COUNTRIES[value] || value : value;

  return (
    <Tooltip error message={error}>
      <DataInputWithValidation
        rowId={rowId}
        colId={colId}
        value={content}
        error={error}
      />
    </Tooltip>
  );
};

const ExtendedRow: FC<RowProps> = (props) => {
  const { rowId } = props;
  const { useErrorDescription } = Publication.STORE;

  const error = useErrorDescription(rowId);

  return (
    <Tooltip
      error
      message={error}
      placement="top-start"
      boundary="main"
      portalRoot="main"
      absoluteCenter
    >
      <Row {...props} />
    </Tooltip>
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

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (
        event.key === Key.ENTER &&
        isElement(event.target) &&
        !(event.target as HTMLInputElement).matches(
          '[data-multiselect-input="true"'
        )
      ) {
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
        <AddCircleIcon className="w-5 h-5" />
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
