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
            <section className="flex p-1 space-x-8 overflow-hidden 2xl:justify-center">
              <div className="overflow-scroll">
                <PublicationIndex
                  entries={actualEntries}
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
                    {selectionSize === 0 && deletedIds.size === 0 && (
                      <p className="self-center mx-3 my-auto text-sm text-center text-gray-400">
                        Select publications by clicking on them to start editing
                      </p>
                    )}
                  </section>
                  <footer>
                    {deletedIds.size > 0 && (
                      <Button
                        type="outline"
                        label="Reset"
                        onClick={() => {
                          setDeletedIds(new Set());
                          clearSelection();
                        }}
                      />
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
