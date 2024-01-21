import Logo from "assets/logo.svg";
import { COUNTRIES, Publication } from "modules/publication";
import Link from "next/link";
import { FC } from "react";
import { z } from "zod";
import { Modal, useURLQueryModal } from "./Modal";
import Tooltip from "./Tooltip";

const Param = z.string().regex(/^\d+$/).transform(Number).optional();
type Param = z.infer<typeof Param>;

const Searchable: FC<{ label: string; value?: string }> = ({
  value,
  label,
}) => {
  const { close } = useURLQueryModal("publication");
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

const PublicationModal: FC = () => {
  const { value, ...modal } = useURLQueryModal("publication");

  const publicationId = Param.parse(value);

  const publication = Publication.STORE.usePublication(publicationId);

  return (
    <Modal isOpen={modal.isOpen} onClose={modal.close}>
      {publication && (
        <article className="relative flex gap-5 p-8 overflow-clip">
          <Logo className="absolute z-50 text-indigo-700 pointer-events-none opacity-20 -left-1/2 -top-96 aspect-square" />
          <hr className="absolute inset-x-7 top-[5.5rem] z-40" />
          <section className="space-y-6">
            <header className="sticky z-30 py-2 text-2xl bg-white top-4">
              <h1 className="flex items-center gap-2 text-2xl font-normal">
                <Tooltip info message="Translation's title">
                  <span>{publication.title}</span>
                </Tooltip>
                <Tooltip info message="Who translated this publication">
                  <span className="text-xl font-light tracking-tighter text-indigo-500">
                    ({publication.authors})
                  </span>
                </Tooltip>
              </h1>
            </header>
            <p>
              <Searchable label={publication.title} /> is a translation of{" "}
              <Searchable label={publication.originalTitle} />, by{" "}
              <Searchable label={publication.originalAuthors} />. It was written{" "}
              by <Searchable label={publication.authors} /> and published in{" "}
              <Searchable
                label={COUNTRIES[publication!.country].label}
                value={COUNTRIES[publication!.country].id}
              />{" "}
              in {publication?.year}.
            </p>
          </section>
        </article>
      )}
    </Modal>
  );
};

export { PublicationModal };
