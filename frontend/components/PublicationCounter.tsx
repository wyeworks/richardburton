import { Publication } from "modules/publication";
import { FC } from "react";
import SparklesIcon from "assets/sparkles.svg";
import Tooltip from "./Tooltip";

const PublicationCounter: FC = () => {
  const publicationCount = Publication.STORE.useVisibleCount();

  return publicationCount !== 0 ? (
    <Tooltip
      info
      message={`${publicationCount} new ${
        publicationCount === 1 ? "publication" : "publications"
      }`}
    >
      <div className="flex items-center px-2 space-x-2 text-xs rounded shadow-sm">
        <SparklesIcon className="w-4 h-4 text-indigo-600" />
        <span>{publicationCount} </span>
      </div>
    </Tooltip>
  ) : null;
};

export default PublicationCounter;
