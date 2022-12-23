import {
  FlatPublicationEntry,
  FlatPublicationKey,
  Publication,
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

const PublicationIndex: FC<Props> = ({ entries, columns }) => {
  const attributes = Publication.ATTRIBUTES.filter((attribute) =>
    columns.has(attribute)
  );

  return (
    <table>
      <tbody>
        <tr>
          {attributes.map((key) => (
            <th key={key} className="sticky top-0 py-2 bg-gray-100">
              {Publication.ATTRIBUTE_LABELS[key]}
            </th>
          ))}
        </tr>
        {entries.map(({ publication }) => (
          <tr key={JSON.stringify(publication)} className="hover:bg-indigo-100">
            {attributes.map((key) => (
              <td key={key} className="max-w-xs px-2 py-1 truncate justify">
                {key === "country"
                  ? COUNTRIES[publication[key]]
                  : publication[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PublicationIndex;
