import { Publication } from "modules/publication";
import { FC } from "react";
import c from "classnames";

const PublicationHiddenAttributes: FC = () => {
  const hiddenAttributes = Publication.STORE.ATTRIBUTES.useHidden();

  return (
    <ol className="flex h-full shadow">
      {hiddenAttributes.map((key) => (
        <li
          key={key}
          className={c(
            "relative origin-top-left w-8 shadow text-xs first:rounded-l last:rounded-r",
            "text-white bg-indigo-600"
          )}
        >
          <div
            className="absolute z-20 text-center rotate-180 translate-x-1/2 top-3 whitespace-nowrap"
            style={{ writingMode: "vertical-lr" }}
          >
            {Publication.ATTRIBUTE_LABELS[key]}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default PublicationHiddenAttributes;
