import Logo from "assets/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { Modal, ModalProps } from "./Modal";

const LearnMoreModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <article className="relative flex gap-5 p-8 overflow-clip">
        <Logo className="absolute z-50 text-indigo-700 pointer-events-none opacity-20 -left-1/2 -top-96 aspect-square" />
        <hr className="absolute inset-x-7 top-[5.5rem] z-40" />
        <section className="w-7/12 space-y-6">
          <header className="sticky z-30 py-2 text-2xl bg-white top-4">
            <h1 className="whitespace-nowrap">
              About the
              <strong className="font-normal"> Richard Burton Platform</strong>
            </h1>
          </header>
          <div className="space-y-4">
            <p>
              The{" "}
              <em className="italic font-normal">Richard Burton Platform</em> is
              an open access online repository with reliable data about
              Brazilian literature in translation to English, stemmed from the
              need to preserve the Brazilian cultural and historical heritage as
              well as its international dissemination. The first version for the
              platform was registered by the{" "}
              <a
                href="https://ifrs.edu.br/"
                target="__blank"
                className="anchor"
              >
                Federal Institute of Education, Science and Technology of Rio
                Grande do Sul (IFRS)
              </a>{" "}
              in 2016, linked to the project{" "}
              <em className="italic font-normal">
                &quot;Brazilian Literature and Transnationalities:
                Displacements, Identities and Technological Experiments&quot;
              </em>
              , with the goal of serving as a tool for readers, researchers,
              academic and governmental institutions interested in accessing
              data on works of Brazilian literature translated into English.
              Furthermore, the platform intends to contribute to translation
              flows worldwide, and the promotion of Brazilian cultural heritage
              in Brazil and abroad, facilitating its access to Anglophone
              readers and researchers.
            </p>
            <p>
              The present version has been developed since 2022, through the
              research project{" "}
              <em className="italic font-normal">
                &quot;Brazilian Literature in Translation: Solutions in Science
                and Technology&quot;
              </em>
              , with support of the{" "}
              <a
                className="anchor"
                target="__blank"
                href="https://fapergs.rs.gov.br/"
              >
                Foundation of Research Support of the Rio Grande do Sul State
                (Fapergs)
              </a>{" "}
              and{" "}
              <a
                className="anchor"
                target="__blank"
                href="https://wyeworks.com"
              >
                WyeWorks
              </a>
              &apos;s collaboration. Its name is derived from Sir Richard
              Francis Burton, one of the pioneers in translating Brazilian
              literature into English. The platform&apos;s data collection
              includes books from Brazilian literature translated into English.
              It doesn&apos;t include anthologies, collections or works
              published in magazines, newspapers and/or electronic media.
            </p>
          </div>
        </section>
        <aside className="w-5/12 space-y-6">
          <header className="sticky z-30 px-1 py-2 bg-white top-4">
            <h2 className="text-lg">
              About<strong className="font-normal"> Richard Burton</strong>
            </h2>
          </header>
          <div className="space-y-4">
            <div className="relative w-1/2 aspect-[0.7] float-right m-1 ml-4">
              <Image
                fill
                alt="Portrait of Sir Richard Burton"
                src="/richard.jpg"
                sizes="(max-width: 300px)"
              />
            </div>
            <p>
              According to{" "}
              <a
                className="anchor"
                target="__blank"
                href="https://burtoniana.org"
              >
                Burtoniana (2024)
              </a>
              , Richard Burton was a soldier, explorer, linguist, ethnologist,
              and controversialist. Mostly self-educated, he mastered half a
              dozen Eastern languages after joining the Army of the East India
              Company in 1842, and is deemed the first translator of a Brazilian
              literature book, together with his wife Isabel Burton:
              &quot;Iracema, The Honey-lips: A legend of Brazil&quot; (1886).
            </p>

            <ol className="ml-5 space-y-2 list-disc">
              <li>
                Read more about Richard Burton&apos;s life in{" "}
                <a
                  href="https://burtoniana.org"
                  target="__blank"
                  className="anchor"
                >
                  burtoniana.org
                </a>
              </li>
              <li>
                Browse books translated by Richard Burton{" "}
                <Link
                  href={`/?search=Richard+Burton`}
                  className="anchor"
                  onClick={onClose}
                >
                  here
                </Link>
              </li>
            </ol>
          </div>
        </aside>
      </article>
    </Modal>
  );
};

export { LearnMoreModal };
