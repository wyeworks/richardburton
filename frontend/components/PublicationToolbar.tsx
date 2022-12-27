import { FC } from "react";
import { API } from "app";
import { Publication } from "modules/publications";
import { useRecoilCallback } from "recoil";
import { useNotifyError } from "./Errors";
import axios from "axios";
import Button from "./Button";
import Router from "next/router";
import {
  getSelection,
  useClearSelection,
  useSelectionSize,
} from "react-selection-manager";

const PublicationToolbar: FC = () => {
  const notifyError = useNotifyError();
  const deletedIds = Publication.STORE.useDeletedIds();

  const selectionSize = useSelectionSize();
  const clearSelection = useClearSelection();

  const setDeleted = Publication.STORE.useSetDeleted();

  const deleteSelected = () => {
    const selectedIds = [...getSelection()] as number[];
    if (selectedIds.length > 0) {
      setDeleted(selectedIds);
      clearSelection();
    }
  };

  const reset = () => {
    const selectedIds = [...getSelection()] as number[];
    setDeleted(selectedIds, false);
    clearSelection();
  };

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
    <aside className="flex flex-col justify-between p-2 space-y-2 rounded shadow w-60 h-1/2">
      <section className="flex flex-col grow">
        <section className="flex flex-col grow">
          <h3 className="flex items-center mb-4 space-x-2 text-sm">
            <span className="border-b grow h-fit" />
            <span className="text-gray-500">Edit</span>
            <span className="border-b grow h-fit" />
          </h3>

          {selectionSize > 0 && (
            <Button
              type="outline"
              label={`Delete ${selectionSize}`}
              onClick={deleteSelected}
            />
          )}
          {selectionSize === 0 && deletedIds.length === 0 && (
            <p className="self-center mx-3 my-auto text-sm text-center text-gray-400">
              Select publications by clicking on them to start editing
            </p>
          )}
        </section>
        <footer>
          {deletedIds.length > 0 && (
            <Button type="outline" label="Reset" onClick={reset} />
          )}
        </footer>
      </section>

      <Button label="Submit" onClick={handleSubmit} />
    </aside>
  );
};

export default PublicationToolbar;
