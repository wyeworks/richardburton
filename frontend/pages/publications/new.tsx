import { NextPage } from "next";
import { Publication } from "modules/publications";
import PublicationIndex from "components/PublicationIndex";

import PublicationToolbar from "components/PublicationToolbar";
import Header from "components/Header";
import Layout from "components/Layout";
import { useEffect } from "react";

const NewPublications: NextPage = () => {
  const publicationCount = Publication.STORE.useCount();
  const validPublicationCount = Publication.STORE.useValidCount();
  const invalidPublicationCount = publicationCount - validPublicationCount;

  const setVisible = Publication.STORE.ATTRIBUTES.useSetVisible();

  useEffect(() => {
    setVisible(Publication.ATTRIBUTES);
  }, [setVisible]);

  return (
    <Layout
      title="Richard Burton"
      header={
        <Header compact>
          <h2 className="my-4 text-4xl text-center">
            <div>{publicationCount} publications about to be inserted...</div>
            {invalidPublicationCount > 0 && (
              <div className="text-lg text-red-500">
                {invalidPublicationCount} of those have errors
              </div>
            )}
          </h2>
        </Header>
      }
      sidebar={<PublicationToolbar edit />}
      content={<PublicationIndex editable />}
    />
  );
};

export default NewPublications;
