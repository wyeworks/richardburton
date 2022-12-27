import { NextPage } from "next";
import { useQuery } from "react-query";
import { API } from "app";
import { Publication } from "modules/publications";
import PublicationIndex from "components/PublicationIndex";
import PublicationToolbar from "components/PublicationToolbar";
import Head from "next/head";

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

  const visibleAttributes = Publication.STORE.ATTRIBUTES.useAllVisible();

  return (
    <>
      <Head>
        <title>Richard Burton</title>
      </Head>
      <div className="flex flex-col h-full">
        <header className="my-4 text-center">
          <h1 className="text-5xl">Richard Burton Platform</h1>
          <h2 className="text-2xl">
            A database about Brazilian literature in translation
          </h2>
        </header>
        <main className="flex justify-center p-4 space-x-8 overflow-hidden">
          <div className="overflow-scroll grow">
            {publications ? (
              <PublicationIndex
                entries={publications.map((publication, index) => ({
                  id: index,
                  publication,
                  errors: null,
                }))}
                attributes={visibleAttributes}
              />
            ) : (
              "loading..."
            )}
          </div>
          <aside>
            <PublicationToolbar filter upload />
          </aside>
        </main>
      </div>
    </>
  );
};

export default Home;
