import SparklesIcon from "assets/sparkles.svg";
import { Publication } from "modules/publication";
import { FC } from "react";
import Button from "./Button";
import Tooltip from "./Tooltip";

const PublicationCounter: FC = () => {
  const publicationCount = Publication.STORE.useVisibleCount();

  const message = `${publicationCount} new ${
    publicationCount === 1 ? "publication" : "publications"
  }`;

  return publicationCount !== 0 ? (
    <Tooltip info message={message}>
      <Button
        variant="outline"
        width="fit"
        Icon={SparklesIcon}
        label={`${publicationCount}`}
      />
    </Tooltip>
  ) : null;
};

export default PublicationCounter;
