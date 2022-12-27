import { NextPage } from "next";
import { Publication } from "modules/publications";
import PublicationIndex from "components/PublicationIndex";
import Head from "next/head";
import Link from "next/link";

import PublicationToolbar from "components/PublicationToolbar";

const NewPublications: NextPage = () => {
  const entries = Publication.STORE.useAll();
  const entriesWithErrors = entries?.filter(({ errors }) => errors);
  const entriesWithErrorsCount = entriesWithErrors?.length || 0;

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
                  attributes={Publication.ATTRIBUTES}
                  editable
                />
              </div>
              <PublicationToolbar />
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
