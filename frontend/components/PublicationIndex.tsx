import classNames from "classnames";
import {
  FlatPublication,
  FlatPublicationEntry,
  FlatPublicationKey,
  Publication,
  PublicationError,
} from "modules/publications";
import { FC } from "react";

const COUNTRIES: Record<string, string> = {
  BR: "Brazil",
  GB: "Great Britain",
  US: "United States",
  CA: "Canada",
  IE: "Ireland",
  NZ: "New Zealand",
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

  const className = {
    "hover:bg-indigo-100": !hasErrors,
    "hover:bg-red-100": hasErrors,
  };

  return (
    <tr
      key={JSON.stringify(publication)}
      className={classNames("group", className)}
    >
      <td className={classNames("sticky left-0 px-2 bg-gray-100", className)}>
        {hasErrors && "❗️"}
      </td>
      {attributes.map((key) => (
        <td key={key} className="max-w-xs px-2 py-1 truncate justify">
          {key === "country" ? COUNTRIES[publication[key]] : publication[key]}
        </td>
      ))}
    </tr>
  );
};

const PublicationIndex: FC<Props> = ({ entries, columns }) => {
  const attributes = Publication.ATTRIBUTES.filter((attribute) =>
    columns.has(attribute)
  );

  return (
    <table>
      <thead className="sticky top-0 z-10 bg-gray-100">
        <tr>
          <th />
          {attributes.map((key) => (
            <th className="px-2 py-1" key={key}>
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
