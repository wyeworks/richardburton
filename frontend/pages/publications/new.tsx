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
import ToolbarHeading from "components/ToolbarHeading";
import PublicationErrorCounter from "components/PublicationErrorCounter";
import PublicationCounter from "components/PublicationCounter";

const NewPublications: NextPage = () => {
  const setAll = Publication.STORE.useSetAll();
  const setVisible = Publication.STORE.ATTRIBUTES.useSetVisible();

  useEffect(() => setAll([]), [setAll]);
  useEffect(() => setVisible(Publication.ATTRIBUTES), [setVisible, setAll]);

  return (
    <Layout
      title="Richard Burton"
      subheader={
        <ToolbarHeading label="Prepare new publications to be inserted in the database" />
      }
      content={<PublicationReview />}
      footer={
        <div className="flex space-x-2">
          <PublicationUpload />
          <ResetOverridden />
          <ResetDeleted />
          <PublicationDelete />
          <PublicationCounter />
          <PublicationErrorCounter />
          <PublicationSubmit />
        </div>
      }
    />
  );
};

export default NewPublications;
