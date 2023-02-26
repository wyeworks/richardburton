import { NextPage } from "next";
import { Publication } from "modules/publications";
import PublicationReview from "components/PublicationReview";

import PublicationToolbar from "components/PublicationToolbar";
import Header from "components/Header";
import Layout from "components/Layout";
import { useEffect } from "react";
import PublicationUpload from "components/PublicationUpload";
import PublicationSubmit from "components/PublicationSubmit";
import ResetDeleted from "components/ResetDeleted";
import ResetOverridden from "components/ResetOverridden";
import PublicationDelete from "components/PublicationDelete";

const NewPublications: NextPage = () => {
  const publicationCount = Publication.STORE.useVisibleCount();
  const validPublicationCount = Publication.STORE.useValidCount();
  const setAll = Publication.STORE.useSetAll();
  const invalidPublicationCount = publicationCount - validPublicationCount;

  const setVisible = Publication.STORE.ATTRIBUTES.useSetVisible();

  useEffect(() => setAll([]), [setAll]);
  useEffect(() => setVisible(Publication.ATTRIBUTES), [setVisible, setAll]);

  return (
    <Layout
      title="Richard Burton"
      header={<Header />}
      subheader={
        <h2 className="my-6 text-4xl text-center">
          <div>
            {publicationCount > 0
              ? `${publicationCount} publications about to be inserted...`
              : "Add publications manually or upload a CSV file"}
          </div>
          <div className="h-4 text-lg text-red-500">
            {invalidPublicationCount > 0 &&
              `${invalidPublicationCount} of those ${
                invalidPublicationCount === 1 ? "has" : "have"
              } errors`}
          </div>
        </h2>
      }
      content={<PublicationReview />}
      footer={
        <div className="flex space-x-2">
          <PublicationUpload />
          <ResetOverridden />
          <ResetDeleted />
          <PublicationDelete />
          <PublicationSubmit />
        </div>
      }
    />
  );
};

export default NewPublications;
