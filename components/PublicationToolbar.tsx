import { FC } from "react";
import { API } from "app";
import { Publication, PublicationKey } from "modules/publications";
import { useRecoilCallback } from "recoil";
import { useNotifyError } from "./Errors";
import axios from "axios";
import Button from "./Button";
import Router from "next/router";
import {
  getSelection,
  useClearSelection,
  useSelectionSize,
} from "react-selection-manager";
import PublicationUpload from "./PublicationUpload";
import Toggle from "./Toggle";

const ToolbarHeading: FC<{ label: string }> = ({ label }) => (
  <h3 className="flex items-center mb-4 space-x-2 text-sm">
    <span className="border-b grow h-fit" />
    <span className="text-gray-500">{label}</span>
    <span className="border-b grow h-fit" />
  </h3>
);

const PublicationEdit: FC = () => {
  const deletedIds = Publication.STORE.useDeletedIds();

  const selectionSize = useSelectionSize();
  const clearSelection = useClearSelection();

  const setDeleted = Publication.STORE.useSetDeleted();

  const deleteSelected = () => {
    const selectedIds = [...getSelection()] as number[];
    if (selectedIds.length > 0) {
      setDeleted(selectedIds);
      clearSelection();
    }
  };

  const reset = () => {
    setDeleted(deletedIds, false);
    clearSelection();
  };

  const isSelectionEmpty = selectionSize === 0;
  const isDeletionSetEmpty = deletedIds.length === 0;

  return (
    <section className="flex flex-col grow">
      <section className="flex flex-col grow">
        <ToolbarHeading label="Edit" />
        {!isSelectionEmpty && (
          <Button
            type="outline"
            label={`Delete ${selectionSize}`}
            onClick={deleteSelected}
          />
        )}
        {isSelectionEmpty && isDeletionSetEmpty && (
          <p className="self-center mx-3 my-auto text-sm text-center text-gray-400">
            Select publications by clicking on them to start editing
          </p>
        )}
      </section>
      <footer>
        {!isDeletionSetEmpty && (
          <Button type="outline" label="Reset" onClick={reset} />
        )}
      </footer>
    </section>
  );
};

const AttributeToggle: FC<{ attribute: PublicationKey }> = ({ attribute }) => {
  const { useIsVisible, useSetVisible } = Publication.STORE.ATTRIBUTES;

  const isActive = useIsVisible(attribute);
  const setVisible = useSetVisible();

  return (
    <Toggle
      key={attribute}
      label={Publication.ATTRIBUTE_LABELS[attribute]}
      startsChecked={isActive}
      onChange={() => setVisible(attribute, !isActive)}
    />
  );
};

const PublicationFilter: FC = () => {
  return (
    <div className="space-y-2">
      <ToolbarHeading label="Filter" />
      {Publication.ATTRIBUTES.map((key) => (
        <AttributeToggle key={key} attribute={key} />
      ))}
    </div>
  );
};

type Props = {
  filter?: boolean;
  edit?: boolean;
  upload?: boolean;
};

const PublicationToolbar: FC<Props> = ({
  filter = false,
  edit = false,
  upload = false,
}) => {
  const notifyError = useNotifyError();

  const handleSubmit = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        try {
          const publications = Publication.STORE.from(snapshot)
            .getAll()
            .map(({ publication }) => publication);

          await API.post("publications/bulk", publications);

          Router.push("/");
        } catch (error) {
          if (axios.isAxiosError(error)) notifyError(error.message);
        }
      },
    []
  );

  return (
    <section className="w-48 p-2 space-y-2">
      <div className="p-2 space-y-2 rounded shadow">
        {filter && <PublicationFilter />}
        {edit && <PublicationEdit />}
        {edit && <Button label="Submit" onClick={handleSubmit} />}
      </div>
      {upload && <PublicationUpload />}
    </section>
  );
};

export default PublicationToolbar;
