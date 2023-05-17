import { Publication } from "modules/publication";
import { FC } from "react";
import SparklesIcon from "assets/sparkles.svg";
import Tooltip from "./Tooltip";
import Button from "./Button";

const PublicationCounter: FC = () => {
  const publicationCount = Publication.STORE.useVisibleCount();

  const message = `${publicationCount} new ${
    publicationCount === 1 ? "publication" : "publications"
  }`;

  return publicationCount !== 0 ? (
    <Tooltip info message={message}>
      <Button
        type="outline"
        width="fit"
        Icon={SparklesIcon}
        label={`${publicationCount}`}
      />
    </Tooltip>
  ) : null;
};

export default PublicationCounter;
