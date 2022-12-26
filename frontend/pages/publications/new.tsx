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
import { useState } from "react";

const NewPublications: NextPage = () => {
  const entries = Publication.STORE.useValue();

  const notifyError = useNotifyError();

  const handleSubmit = async () => {
    if (entries) {
      try {
        const publications = entries.map(({ publication }) => publication);

        await API.post("publications/bulk", publications);

        Router.push("/");
      } catch (error) {
        if (axios.isAxiosError(error)) notifyError(error.message);
      }
    }
  };

  const [deletedIds, setDeletedIds] = useState(new Set());
  const selectionSize = useSelectionSize();
  const clearSelection = useClearSelection();

  const actualEntries = entries?.filter(({ id }) => !deletedIds.has(id));
  const actualEntriesWithErrors = actualEntries?.filter(({ errors }) => errors);
  const actualEntriesWithErrorsCount = actualEntriesWithErrors?.length || 0;

  console.log({ deletedIds, actualEntries });

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
              {actualEntries?.length} publications about to be inserted...
            </h1>
            {actualEntriesWithErrorsCount > 0 && (
              <label className="text-lg text-red-500">
                {actualEntriesWithErrorsCount} of those have errors
              </label>
            )}
          </header>

          {actualEntries ? (
            <section className="flex space-x-8 overflow-hidden 2xl:justify-center">
              <div className="overflow-scroll">
                <PublicationIndex
                  entries={actualEntries}
                  columns={new Set(Publication.ATTRIBUTES)}
                  editable
                />
              </div>
              <aside className="flex flex-col space-y-2">
                <Button label="Submit" onClick={handleSubmit} />

                {deletedIds.size > 0 && (
                  <Button
                    label="Reset publications"
                    onClick={() => {
                      setDeletedIds(new Set());
                      clearSelection();
                    }}
                  />
                )}
                {selectionSize > 0 && (
                  <Button
                    label={`Delete ${selectionSize}`}
                    onClick={() => {
                      const selectedIds = getSelection();

                      if (selectedIds) {
                        setDeletedIds(
                          (current) => new Set([...current, ...selectedIds])
                        );
                        clearSelection();
                      }
                    }}
                  />
                )}
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
