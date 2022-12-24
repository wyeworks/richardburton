import classNames from "classnames";
import {
  FlatPublication,
  FlatPublicationEntry,
  FlatPublicationKey,
  Publication,
  PublicationError,
} from "modules/publications";
import { FC } from "react";
import { isString } from "lodash";
import Tooltip from "./Tooltip";
import ErrorTooltip from "./ErrorTooltip";

const COUNTRIES: Record<string, string> = {
  BR: "Brazil",
  GB: "Great Britain",
  US: "United States",
  CA: "Canada",
  IE: "Ireland",
  NZ: "New Zealand",
};

const ERROR_MESSAGES: Record<string, string> = {
  conflict: "A publication with this data already exists",
};

type Props = {
  entries: FlatPublicationEntry[];
  columns: Set<FlatPublicationKey>;
};

type RowProps = {
  attributes: FlatPublicationKey[];
  publication: FlatPublication;
  errors: PublicationError;
};

const Row: FC<RowProps> = ({ attributes, publication, errors }) => {
  const hasErrors = Boolean(errors);
  const errorString =
    (hasErrors && isString(errors) && (ERROR_MESSAGES[errors] || errors)) || "";

  return (
    <ErrorTooltip
      message={errorString}
      hidden={!Boolean(errorString)}
      followCursor="x"
      placement="top-start"
    >
      <tr
        className={classNames("group cursor-pointer", {
          "hover:bg-indigo-100": !hasErrors,
          "hover:bg-red-100": hasErrors,
        })}
      >
        <td
          className={classNames("sticky left-0 px-2 bg-gray-100", {
            "group-hover:bg-indigo-100": !hasErrors,
            "group-hover:bg-red-100": hasErrors,
          })}
        >
          {hasErrors && "❗️"}
        </td>
        {attributes.map((key) => (
          <td key={key} className="max-w-xs px-2 py-1 truncate justify">
            {key === "country" ? COUNTRIES[publication[key]] : publication[key]}
          </td>
        ))}
      </tr>
    </ErrorTooltip>
  );
};

const PublicationIndex: FC<Props> = ({ entries, columns }) => {
  const attributes = Publication.ATTRIBUTES.filter((attribute) =>
    columns.has(attribute)
  );

  return (
    <table className="overflow-auto">
      <thead className="sticky top-0 z-10 bg-gray-100">
        <tr>
          <th />
          {attributes.map((key) => (
            <th className="px-2 py-4" key={key}>
              {Publication.ATTRIBUTE_LABELS[key]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <Row attributes={attributes} {...entry} />
        ))}
      </tbody>
    </table>
  );
};

export default PublicationIndex;
