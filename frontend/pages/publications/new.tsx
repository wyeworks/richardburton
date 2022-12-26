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

  const invalidPublicationCount =
    entries?.filter(({ errors }) => Boolean(errors)).length || 0;

  return (
    <>
      <Head>
        <title>New Publications</title>
      </Head>
      <div className="flex flex-col h-full">
        <header className="py-2 text-center text-white bg-indigo-600">
          <Link href="/">
            <a className="inline px-4 py-1 text-xl font-medium border-r">
              Richard Burton Platform
            </a>
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
            {invalidPublicationCount > 0 && (
              <label className="text-lg text-red-500">
                {invalidPublicationCount} of those have errors
              </label>
            )}
          </header>

          {entries ? (
            <section className="flex space-x-8 overflow-hidden 2xl:justify-center">
              <div className="overflow-scroll">
                <PublicationIndex
                  entries={entries}
                  columns={new Set(Publication.ATTRIBUTES)}
                />
              </div>
              <aside>
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
