import { NextPage } from "next";
import { Publication } from "modules/publications";
import PublicationIndex from "components/PublicationIndex";
import Head from "next/head";

import PublicationToolbar from "components/PublicationToolbar";
import Header from "components/Header";

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
        <Header compact />
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
        <div className="flex justify-center p-4 space-x-8 overflow-hidden">
          <main className="flex justify-center overflow-scroll grow">
            <PublicationIndex
              entries={entries}
              attributes={Publication.ATTRIBUTES}
              editable
            />
          </main>
          <aside>
            <PublicationToolbar edit />
          </aside>
        </div>
      </div>
    </>
  );
};

export default NewPublications;
