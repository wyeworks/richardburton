import type { NextPage } from "next";
import PublicationIndex from "components/PublicationIndex";
import Head from "next/head";
import Button from "components/Button";
import { API } from "app";
import Router from "next/router";
import { useNotifyError } from "components/Errors";
import axios from "axios";
import Link from "next/link";
import { Publication } from "modules/publications";
import {
  getSelection,
  useClearSelection,
  useSelectionSize,
} from "react-selection-manager";
import { useRecoilCallback } from "recoil";

const NewPublications: NextPage = () => {
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

  const entries = Publication.STORE.useAll();
  const entriesWithErrors = entries?.filter(({ errors }) => errors);
  const entriesWithErrorsCount = entriesWithErrors?.length || 0;

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
    setDeleted(deletedIds, false);
    clearSelection();
  };

  return (
    <>
      <Head>
        <title>New Publications</title>
      </Head>
      <div className="flex flex-col h-full">
        <header className="py-2 text-center text-white bg-indigo-600">
          <Link
            href="/"
            className="inline px-4 py-1 text-xl font-medium border-r"
          >
            Richard Burton Platform
          </Link>
          <span className="inline px-4 text-lg">
            A database about Brazilian literature in translation
          </span>
        </header>
        <main className="flex flex-col p-4 overflow-hidden gap-y-8">
          <header className="my-4 text-center">
            <h1 className="text-4xl">
              {entries?.length} publications about to be inserted...
            </h1>
            {entriesWithErrorsCount > 0 && (
              <label className="text-lg text-red-500">
                {entriesWithErrorsCount} of those have errors
              </label>
            )}
          </header>

          {entries ? (
            <section className="flex p-1 space-x-8 overflow-hidden 2xl:justify-center">
              <div className="overflow-scroll">
                <PublicationIndex
                  entries={entries}
                  columns={new Set(Publication.ATTRIBUTES)}
                  editable
                />
              </div>
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
            </section>
          ) : (
            "loading..."
          )}
        </main>
      </div>
    </>
  );
};

export default NewPublications;
