import { NextPage } from "next";
import { Publication } from "modules/publications";
import PublicationReview from "components/PublicationReview";

import PublicationToolbar from "components/PublicationToolbar";
import Header from "components/Header";
import Layout from "components/Layout";
import { useEffect } from "react";

const NewPublications: NextPage = () => {
  const publicationCount = Publication.STORE.useVisibleCount();
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
            <div className="h-4 text-lg text-red-500">
              {invalidPublicationCount > 0 &&
                `${invalidPublicationCount} of those ${
                  invalidPublicationCount === 1 ? "has" : "have"
                } errors`}
            </div>
          </h2>
        </Header>
      }
      sidebar={<PublicationToolbar edit upload />}
      content={<PublicationReview />}
    />
  );
};

export default NewPublications;
