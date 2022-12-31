import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import Button from "./Button";
import Router from "next/router";
import Toggle from "./Toggle";
import UploadIcon from "assets/upload.svg";
import {
  Publication,
  PublicationKey,
  ValidationResult,
} from "modules/publications";
import {
  getSelection,
  useClearSelection,
  useSelectionSize,
} from "react-selection-manager";
import classNames from "classnames";
import Link from "next/link";
import AddIcon from "assets/add.svg";
import Tooltip from "./Tooltip";

const ToolbarHeading: FC<{ label: string }> = ({ label }) => (
  <h3 className="flex items-center space-x-2 text-sm">
    <span className="border-b grow h-fit" />
    <span className="text-gray-500">{label}</span>
    <span className="border-b grow h-fit" />
  </h3>
);

const PublicationEdit: FC = () => {
  const {
    useDeletedCount,
    useOverriddenCount,
    useOverriddenIds,
    useSetDeleted,
    useResetDeleted,
    useResetOverridden,
  } = Publication.STORE;

  const setDeleted = useSetDeleted();
  const resetDeleted = useResetDeleted();
  const resetOverridden = useResetOverridden();
  const validate = Publication.REMOTE.useValidate();

  const overriddenIds = useOverriddenIds();
  const deletedCount = useDeletedCount();
  const overriddenCount = useOverriddenCount();

  const selectionSize = useSelectionSize();
  const clearSelection = useClearSelection();

  const deleteSelected = () => {
    const selectedIds = [...getSelection()] as number[];
    if (selectedIds.length > 0) {
      setDeleted(selectedIds);
      clearSelection();
    }
  };

  const reset = () => {
    resetDeleted();
    resetOverridden();
    clearSelection();
    validate(overriddenIds);
  };

  const isSelectionEmpty = selectionSize === 0;
  const isDeletionSetEmpty = deletedCount === 0;
  const isOverrideSetEmpty = overriddenCount === 0;
  const isResetEnabled = !isDeletionSetEmpty || !isOverrideSetEmpty;

  return (
    <section className="flex flex-col grow">
      <div className="flex flex-col space-y-2 grow">
        <ToolbarHeading label="Edit" />

        {!isSelectionEmpty && (
          <Button
            type="outline"
            label={`Delete ${selectionSize}`}
            onClick={deleteSelected}
          />
        )}

        <div className="flex items-center justify-center text-sm text-gray-400 grow">
          {isResetEnabled ? (
            <ul>
              <li className="h-4">
                {deletedCount > 0 && `${deletedCount} deleted`}
              </li>
              <li className="h-4">
                {overriddenCount > 0 && `${overriddenCount} updated`}
              </li>
            </ul>
          ) : (
            <p className="self-center m-3.5 text-center">
              Select publications to delete them, or click on the columns to
              start editing
            </p>
          )}
        </div>
      </div>

      {isResetEnabled && (
        <footer className="mt-auto">
          <Tooltip info message="Reset updates and deletions" placement="left">
            <Button type="outline" label="Reset" onClick={reset} />
          </Tooltip>
        </footer>
      )}
    </section>
  );
};

const AttributeToggle: FC<{ attribute: PublicationKey }> = ({ attribute }) => {
  const { useIsVisible, useSetVisible } = Publication.STORE.ATTRIBUTES;

  const isActive = useIsVisible(attribute);
  const setVisible = useSetVisible();

  return (
    <Toggle
      label={Publication.ATTRIBUTE_LABELS[attribute]}
      checked={isActive}
      onClick={() => setVisible([attribute], !isActive)}
    />
  );
};

const PublicationFilter: FC = () => {
  const resetVisibleAttributes = Publication.STORE.ATTRIBUTES.useResetAll();

  useEffect(() => resetVisibleAttributes(), [resetVisibleAttributes]);

  return (
    <section className="space-y-2">
      <ToolbarHeading label="Filter" />
      {Publication.ATTRIBUTES.map((key) => (
        <AttributeToggle key={key} attribute={key} />
      ))}
    </section>
  );
};

const PublicationUpload: FC = () => {
  const { useResetAll, useTotalCount } = Publication.STORE;
  const { useRequest } = Publication.REMOTE;

  const resetPublications = useResetAll();
  const totalPublications = useTotalCount();

  const [key, setKey] = useState(1);

  const handleChange = useRequest(
    ({ set }, http) =>
      async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
          const [file] = event.target.files;
          const payload = new FormData();
          payload.append("csv", file);

          try {
            const { data } = await http.post<ValidationResult[]>(
              "publications/validate",
              payload
            );
            const entries = data.map((p, index) => ({ ...p, id: index }));
            Publication.STORE.with({ set }).setPublications(entries);
            Publication.STORE.with({ set }).setErrors(entries);
          } catch (error: any) {
            event.target.files = null;
            setKey((key) => -key);
            throw error;
          }
        }
      }
  );

  useEffect(() => resetPublications(), [resetPublications]);

  const message = totalPublications > 0 ? "Current data will be replaced!" : "";

  return (
    <Tooltip warning message={message} placement="left">
      <label className="flex flex-col items-center justify-center text-sm transition-colors bg-gray-100 rounded-lg shadow cursor-pointer aspect-square hover:bg-gray-200">
        Upload .csv
        <UploadIcon className="w-8 h-8 text-indigo-800" />
        <input
          key={key}
          type="file"
          id="upload-csv"
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </Tooltip>
  );
};

const PublicationNav: FC = () => {
  return (
    <nav className="flex w-full">
      <Link
        className="flex flex-col items-center justify-center space-y-2 text-center transition-colors bg-gray-100 rounded-lg shadow cursor-pointer grow aspect-square hover:bg-gray-200"
        href="publications/new"
      >
        <div className="flex flex-col items-center text-lg text-indigo-800">
          <AddIcon className="w-8 h-8" />
          Add Publications
        </div>
        <p className="mx-6 text-xs text-center">
          Click here to go to the new publications page and add new data
        </p>
      </Link>
    </nav>
  );
};

const PublicationSubmit: FC = () => {
  const bulk = Publication.REMOTE.useBulk();

  const handleSubmit = useCallback(
    () => bulk().then(() => Router.push("/")),
    [bulk]
  );

  const publicationCount = Publication.STORE.useVisibleCount();
  const validPublicationCount = Publication.STORE.useValidCount();
  const invalidPublicationCount = publicationCount - validPublicationCount;

  const isValidating = Publication.STORE.useIsValidating();

  const isSubmitDisabled =
    isValidating || publicationCount === 0 || invalidPublicationCount > 0;

  return (
    <Tooltip
      info
      message="Save the publications to the repository"
      placement="left"
    >
      <Button
        label="Submit"
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
      />
    </Tooltip>
  );
};

type Props = {
  filter?: boolean;
  edit?: boolean;
  upload?: boolean;
  nav?: boolean;
};

const PublicationToolbar: FC<Props> = ({
  filter = false,
  edit = false,
  upload = false,
  nav = false,
}) => {
  return (
    <section
      className={classNames(
        "flex flex-col w-48 p-2 space-y-2",
        edit && "min-h-toolbar"
      )}
    >
      {nav && <PublicationNav />}
      <div className="flex flex-col p-2 space-y-2 rounded shadow grow">
        {filter && <PublicationFilter />}
        {edit && <PublicationEdit />}
        {edit && <PublicationSubmit />}
      </div>
      {upload && <PublicationUpload />}
    </section>
  );
};

export default PublicationToolbar;
