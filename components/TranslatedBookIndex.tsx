import { FC, PropsWithChildren } from "react";
import { TranslatedBook } from "types";

const COUNTRIES: Record<string, string> = {
  BR: "Brazil",
  GB: "Great Britain",
  US: "United States",
  CA: "Canada",
  IE: "Ireland",
  NZ: "New Zealand",
};

const Header: FC<PropsWithChildren> = ({ children }) => {
  return <th className="sticky top-0 py-2 bg-gray-100">{children}</th>;
};

const Column: FC<PropsWithChildren> = ({ children }) => {
  return <td className="max-w-xs px-2 py-1 truncate justify">{children}</td>;
};

type Props = { entries: TranslatedBook[] };

const TranslatedBookIndex: FC<Props> = ({ entries }) => {
  return (
    <table>
      <tbody>
        <tr>
          <Header>Original title</Header>
          <Header>Original authors</Header>
          <Header>Translators</Header>
          <Header>Title</Header>
          <Header>Year</Header>
          <Header>Country</Header>
          <Header>Publisher</Header>
        </tr>
        {entries.map(
          ({ authors, originalBook, publications: [firstPublication] }) => (
            <tr>
              <Column>{originalBook.title}</Column>
              <Column>{originalBook.authors}</Column>
              <Column>{authors}</Column>
              <Column>{firstPublication.title}</Column>
              <Column>{firstPublication.year}</Column>
              <Column>{COUNTRIES[firstPublication.country]}</Column>
              <Column>{firstPublication.publisher}</Column>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};

export default TranslatedBookIndex;
