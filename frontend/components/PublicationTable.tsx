import classNames from "classnames";
import {
  Publication,
  PublicationId,
  PublicationKey,
} from "modules/publications";
import { FC } from "react";

const ColumnHeader: FC<{ attribute: PublicationKey }> = ({ attribute }) => {
  const isVisible = Publication.STORE.ATTRIBUTES.useIsVisible(attribute);

  return isVisible ? (
    <th className="px-2 py-4">{Publication.ATTRIBUTE_LABELS[attribute]}</th>
  ) : null;
};

const Column: FC<{
  publicationId: PublicationId;
  attribute: PublicationKey;
}> = ({ publicationId, attribute }) => {
  const isVisible = Publication.STORE.ATTRIBUTES.useIsVisible(attribute);
  const content = Publication.STORE.ATTRIBUTES.useValue(
    publicationId,
    attribute
  );

  return isVisible ? (
    <td className={"max-w-xs px-2 py-1 justify group-hover:bg-indigo-100"}>
      <div className="px-2 py-1 truncate">{content}</div>
    </td>
  ) : null;
};

const Row: FC<{ publicationId: PublicationId }> = ({ publicationId }) => {
  return (
    <tr className="relative group" data-selectable="true">
      {Publication.ATTRIBUTES.map((attribute) => (
        <Column
          key={attribute}
          attribute={attribute}
          publicationId={publicationId}
        />
      ))}
    </tr>
  );
};

const PublicationTable: FC = () => {
  const ids = Publication.STORE.useVisibleIds();

  return (
    <table className={classNames("overflow-auto")}>
      <thead className="sticky top-0 z-10 bg-gray-100">
        <tr>
          {Publication.ATTRIBUTES.map((key) => (
            <ColumnHeader key={key} attribute={key} />
          ))}
        </tr>
      </thead>
      <tbody>
        {ids.map((id) => (
          <Row key={id} publicationId={id} />
        ))}
      </tbody>
    </table>
  );
};

export default PublicationTable;
