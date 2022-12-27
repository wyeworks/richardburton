import { NextPage } from "next";
import { useQuery } from "react-query";
import { API } from "app";
import PublicationIndex from "components/PublicationIndex";
import Toggle from "components/Toggle";
import Head from "next/head";
import PublicationUpload from "components/PublicationUpload";
import { Publication, PublicationKey } from "modules/publications";
import { FC } from "react";

const AttributeToggle: FC<{ attribute: PublicationKey }> = ({ attribute }) => {
  const { useIsVisible, useSetVisible } = Publication.STORE.ATTRIBUTES;

  const isActive = useIsVisible(attribute);
  const setVisible = useSetVisible();

  return (
    <Toggle
      key={attribute}
      label={Publication.ATTRIBUTE_LABELS[attribute]}
      startsChecked={isActive}
      onChange={() => setVisible(attribute, !isActive)}
    />
  );
};

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
              {Publication.ATTRIBUTES.map((key) => (
                <AttributeToggle key={key} attribute={key} />
              ))}
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
              attributes={visibleAttributes}
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
