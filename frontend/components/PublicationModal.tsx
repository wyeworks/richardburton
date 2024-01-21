import { COUNTRIES, Publication } from "modules/publication";
import Link from "next/link";
import { FC } from "react";
import { z } from "zod";
import { Article } from "./Article";
import { Modal, useURLQueryModal } from "./Modal";
import Tooltip from "./Tooltip";

const PUBLICATION_MODAL_KEY = "publication";

const Param = z.string().regex(/^\d+$/).transform(Number).optional();
type Param = z.infer<typeof Param>;

const Searchable: FC<{ label: string; value?: string }> = ({
  value,
  label,
}) => {
  const { close } = useURLQueryModal(PUBLICATION_MODAL_KEY);
  return (
    <Link
      href={`/?search=${value || label}`}
      className="anchor"
      onClick={close}
    >
      {label}
    </Link>
  );
};

const PublicationHeading: FC<{ publication: Publication }> = ({
  publication,
}) => (
  <div className="flex items-center gap-2 text-2xl font-normal">
    <Tooltip info message="Translation's title">
      <span>{publication.title}</span>
    </Tooltip>
    <Tooltip info message="Who translated this publication">
      <span className="text-xl font-light tracking-tighter text-indigo-500">
        ({publication.authors})
      </span>
    </Tooltip>
  </div>
);

const PublicationDescription: FC<{ publication: Publication }> = ({
  publication,
}) => (
  <p>
    <Searchable label={publication.title} /> is a translation of{" "}
    <Searchable label={publication.originalTitle} />, by{" "}
    <Searchable label={publication.originalAuthors} />. It was written by{" "}
    <Searchable label={publication.authors} /> and published in{" "}
    <Searchable
      label={COUNTRIES[publication!.country].label}
      value={COUNTRIES[publication!.country].id}
    />{" "}
    in {publication?.year}.
  </p>
);

const PublicationModal: FC = () => {
  const { value, ...modal } = useURLQueryModal(PUBLICATION_MODAL_KEY);

  const publicationId = Param.parse(value);

  const publication = Publication.STORE.usePublication(publicationId);

  return (
    <Modal isOpen={modal.isOpen} onClose={modal.close}>
      {publication && (
        <Article
          heading={<PublicationHeading publication={publication} />}
          content={<PublicationDescription publication={publication} />}
        />
      )}
    </Modal>
  );
};

export { PUBLICATION_MODAL_KEY, PublicationModal };
