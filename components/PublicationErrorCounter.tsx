import { Publication } from "modules/publication";
import { FC } from "react";
import ErrorCircleIcon from "assets/error-circle.svg";
import Tooltip from "./Tooltip";

const PublicationErrorCounter: FC = () => {
  const publicationCount = Publication.STORE.useVisibleCount();
  const validPublicationCount = Publication.STORE.useValidCount();
  const invalidPublicationCount = publicationCount - validPublicationCount;

  return invalidPublicationCount !== 0 ? (
    <Tooltip
      error
      message={`${invalidPublicationCount} ${
        publicationCount === 1 ? "publication" : "publications"
      } with errors`}
    >
      <div className="flex items-center px-2 space-x-2 text-xs text-white bg-red-500 rounded shadow-sm">
        <ErrorCircleIcon className="w-4 h-4" />
        <span>{invalidPublicationCount} </span>
      </div>
    </Tooltip>
  ) : null;
};

export default PublicationErrorCounter;
