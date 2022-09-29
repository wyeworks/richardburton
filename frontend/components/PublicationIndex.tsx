import { FC } from "react";
import { FlatPublication, PUBLICATION_ATTRIBUTE_LABELS } from "types";

const COUNTRIES: Record<string, string> = {
  BR: "Brazil",
  GB: "Great Britain",
  US: "United States",
  CA: "Canada",
  IE: "Ireland",
  NZ: "New Zealand",
};

type Props = {
  entries: FlatPublication[];
  columns: (keyof FlatPublication)[];
};

const PublicationIndex: FC<Props> = ({ entries, columns }) => {
  return (
    <table>
      <tbody>
        <tr>
          {columns.map((key) => (
            <th key={key} className="sticky top-0 py-2 bg-gray-100">
              {PUBLICATION_ATTRIBUTE_LABELS[key]}
            </th>
          ))}
        </tr>
        {entries.map((entry) => (
          <tr key={JSON.stringify(entry)}>
            {columns.map((key) => (
              <td key={key} className="max-w-xs px-2 py-1 truncate justify">
                {key === "country" ? COUNTRIES[entry[key]] : entry[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PublicationIndex;
