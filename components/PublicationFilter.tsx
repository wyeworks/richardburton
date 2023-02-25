import { Publication, PublicationKey } from "modules/publications";
import { FC, useEffect } from "react";
import Toggle from "./Toggle";
import ToolbarHeading from "./ToolbarHeading";

const AttributeToggle: FC<{ attribute: PublicationKey }> = ({ attribute }) => {
  const { useIsVisible, useSetVisible } = Publication.STORE.ATTRIBUTES;

  const isActive = useIsVisible(attribute);
  const setVisible = useSetVisible();

  return (
    <Toggle
      label={Publication.ATTRIBUTE_LABELS[attribute]}
      checked={isActive}
      onClick={() => setVisible([attribute], !isActive)}
    />
  );
};

const PublicationFilter: FC = () => {
  const resetVisibleAttributes = Publication.STORE.ATTRIBUTES.useResetAll();

  useEffect(() => resetVisibleAttributes(), [resetVisibleAttributes]);

  return (
    <section className="space-y-2">
      <ToolbarHeading label="Filter" />
      {Publication.ATTRIBUTES.map((key) => (
        <AttributeToggle key={key} attribute={key} />
      ))}
    </section>
  );
};

export default PublicationFilter;
