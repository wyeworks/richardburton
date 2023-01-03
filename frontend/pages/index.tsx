import type { NextPage } from "next";
import { useQuery } from "react-query";
import { API } from "app";
import PublicationIndex from "components/PublicationIndex";
import Toggle from "components/Toggle";
import Head from "next/head";
import { useState } from "react";
import PublicationUpload from "components/PublicationUpload";
import { PublicationKey, Publication } from "modules/publications";

const DEFAULT_COLUMNS: PublicationKey[] = [
  "originalTitle",
  "title",
  "authors",
  "year",
];

const Home: NextPage = () => {
  const { data: publications } = useQuery<Publication[]>(
    "publications",
    async () => {
      try {
        const { data } = await API.get("publications");
        return data;
      } catch (error) {
        return error;
      }
    }
  );

  const [columns, setColumns] = useState(new Set(DEFAULT_COLUMNS));

  return (
    <>
      <Head>
        <title>Richard Burton</title>
      </Head>
      <div className="relative flex flex-col h-full p-8 overflow-hidden gap-y-8 xl:mx-auto max-w-7xl pr-52">
        <header className="space-y-2 text-center ">
          <h1 className="text-5xl">Richard Burton Platform</h1>
          <h2 className="text-2xl">
            A database about Brazilian literature in translation
          </h2>
        </header>

        <main className="w-full overflow-scroll">
          <aside className="absolute right-0 p-2 space-y-6">
            <div className="space-y-2">
              {Publication.ATTRIBUTES.map((attribute) => {
                const isActive = columns.has(attribute);
                const newColumns = new Set(columns);

                if (isActive) {
                  newColumns.delete(attribute);
                } else {
                  newColumns.add(attribute);
                }

                return (
                  <Toggle
                    key={attribute}
                    label={Publication.ATTRIBUTE_LABELS[attribute]}
                    startsChecked={isActive}
                    onChange={() => setColumns(newColumns)}
                  />
                );
              })}
            </div>
            <PublicationUpload />
          </aside>
          {publications ? (
            <PublicationIndex
              entries={publications.map((publication, index) => ({
                id: index,
                publication,
                errors: null,
              }))}
              columns={columns}
            />
          ) : (
            "loading..."
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
