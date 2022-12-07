import type { NextPage } from "next";
import { fromFlatPublications, PUBLICATION_ATTRIBUTES } from "types";
import PublicationIndex from "components/PublicationIndex";
import Head from "next/head";
import { useRecoilValue } from "recoil";
import uploadedPublicationsAtom from "recoil/uploadedPublicationsAtom";
import Button from "components/Button";
import { API } from "app";
import Router from "next/router";

const NewPublications: NextPage = () => {
  const uploadedPublications = useRecoilValue(uploadedPublicationsAtom);

  const handleSubmit = async () => {
    if (uploadedPublications) {
      await API.post(
        "publications",
        fromFlatPublications(uploadedPublications)
      );
      Router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>New Publications</title>
      </Head>
      <div className="flex flex-col h-full">
        <header className="py-2 text-center text-white bg-indigo-600">
          <span className="inline px-4 py-1 text-xl font-medium border-r">
            Richard Burton Platform
          </span>
          <span className="inline px-4 text-lg">
            A database about Brazilian literature in translation
          </span>
        </header>
        <main className="flex flex-col p-4 overflow-hidden gap-y-8">
          <h1 className="my-4 text-4xl text-center ">
            {uploadedPublications?.length} publications about to be inserted...
          </h1>

          {uploadedPublications ? (
            <section className="flex space-x-8 overflow-hidden 2xl:justify-center">
              <div className="overflow-scroll">
                <PublicationIndex
                  entries={uploadedPublications}
                  columns={new Set(PUBLICATION_ATTRIBUTES)}
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
