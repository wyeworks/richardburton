import { ChangeEvent, FC, useEffect, useState } from "react";
import { API } from "app";
import { useRecoilCallback } from "recoil";
import { useNotifyError } from "./Errors";
import { range } from "lodash";
import axios from "axios";
import Button from "./Button";
import Router from "next/router";
import Toggle from "./Toggle";
import UploadIcon from "assets/upload.svg";
import {
  Publication,
  PublicationEntry,
  PublicationKey,
} from "modules/publications";
import {
  getSelection,
  useClearSelection,
  useSelectionSize,
} from "react-selection-manager";

const ToolbarHeading: FC<{ label: string }> = ({ label }) => (
  <h3 className="flex items-center space-x-2 text-sm">
    <span className="border-b grow h-fit" />
    <span className="text-gray-500">{label}</span>
    <span className="border-b grow h-fit" />
  </h3>
);

const PublicationEdit: FC = () => {
  const { useDeletedCount, useSetDeleted, useResetDeleted } = Publication.STORE;

  const setDeleted = useSetDeleted();
  const resetDeleted = useResetDeleted();
  const deletedCount = useDeletedCount();

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
    clearSelection();
  };

  const isSelectionEmpty = selectionSize === 0;
  const isDeletionSetEmpty = deletedCount === 0;

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
        {isSelectionEmpty && isDeletionSetEmpty && (
          <div className="flex items-center justify-center grow">
            <p className="self-center m-3 text-sm text-center text-gray-400">
              Select publications by clicking on them to start editing
            </p>
          </div>
        )}
      </div>

      {!isDeletionSetEmpty && (
        <footer className="mt-auto">
          <Button type="outline" label="Reset" onClick={reset} />
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
  const { useSetAll, useResetAll } = Publication.STORE;
  const notifyError = useNotifyError();
  const setPublications = useSetAll();
  const resetPublications = useResetAll();

  const [key, setKey] = useState(1);

  const handleChange = useRecoilCallback(
    () => async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const [file] = event.target.files;

        const data = new FormData();
        data.append("csv", file);

        try {
          const { data: parsed } = await API.post<
            Omit<PublicationEntry, "id">[]
          >("publications/validate", data);

          const ids = range(0, parsed.length);

          setPublications(
            ids,
            parsed.map(({ publication, errors }, index) => ({
              id: ids[index],
              publication,
              errors,
            }))
          );

          Router.push("publications/new");
        } catch (error) {
          event.target.files = null;
          setKey((key) => -key);
          if (axios.isAxiosError(error)) {
            const { response, message } = error;
            const descriptiveError =
              response && Publication.describe(response.data as string);

            notifyError(descriptiveError || message);
          }
        }
      }
    },
    []
  );

  useEffect(() => resetPublications(), [resetPublications]);

  return (
    <label className="flex flex-col items-center justify-center text-sm rounded-lg shadow cursor-pointer aspect-square hover:bg-gray-200">
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
  );
};

type Props = {
  filter?: boolean;
  edit?: boolean;
  upload?: boolean;
};

const PublicationToolbar: FC<Props> = ({
  filter = false,
  edit = false,
  upload = false,
}) => {
  const notifyError = useNotifyError();

  const handleSubmit = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        try {
          const publications = Publication.STORE.from(snapshot)
            .getAll()
            .map(({ publication }) => publication);

          await API.post("publications/bulk", publications);

          Router.push("/");
        } catch (error) {
          if (axios.isAxiosError(error)) notifyError(error.message);
        }
      },
    []
  );

  return (
    <section className="flex flex-col w-48 p-2 space-y-2 min-h-1/2">
      <div className="flex flex-col p-2 space-y-2 rounded shadow grow">
        {filter && <PublicationFilter />}
        {edit && <PublicationEdit />}
        {edit && <Button label="Submit" onClick={handleSubmit} />}
      </div>
      {upload && <PublicationUpload />}
    </section>
  );
};

export default PublicationToolbar;
