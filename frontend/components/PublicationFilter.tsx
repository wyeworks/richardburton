import { Publication, PublicationKey } from "modules/publication";
import { FC, useEffect } from "react";
import Toggle from "./Toggle";

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
    <section className="flex space-x-2">
      {Publication.ATTRIBUTES.map((key) => (
        <AttributeToggle key={key} attribute={key} />
      ))}
    </section>
  );
};

export default PublicationFilter;
