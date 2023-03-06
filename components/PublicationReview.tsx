import classNames from "classnames";
import { Publication } from "modules/publications";
import {
  FC,
  forwardRef,
  KeyboardEventHandler,
  MouseEvent,
  useCallback,
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
import { isElement } from "lodash";
import { Key } from "app";
import AddCircleIcon from "assets/add-circle.svg";
import ErrorIcon from "assets/error.svg";
import DataInput from "./DataInput";

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

const AutovalidatedData: typeof Content = ({ rowId, colId, value, error }) => {
  const content = colId === "country" ? COUNTRIES[value] || value : value;

  return (
    <Tooltip error message={error}>
      <DataInput
        rowId={rowId}
        colId={colId}
        value={content}
        error={Boolean(error)}
        autoValidated
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
          '[data-multiselect-input="true"]'
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
      error={Boolean(error)}
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
