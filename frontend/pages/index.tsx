import AddIcon from "assets/add.svg";
import Dot from "assets/dot.svg";
import Anchor from "components/Anchor";
import Button from "components/Button";
import { CONTACT_MODAL_KEY, ContactModal } from "components/ContactModal";
import { Counter } from "components/Counter";
import Layout from "components/Layout";
import {
  LEARN_MORE_MODAL_KEY,
  LearnMoreModal,
} from "components/LearnMoreModal";
import { useURLQueryModal } from "components/Modal";
import PublicationDownload from "components/PublicationDownload";
import PublicationHiddenAttributes from "components/PublicationHiddenAttributes";
import { PublicationIndexList } from "components/PublicationIndexList";
import { PublicationIndexTable } from "components/PublicationIndexTable";
import {
  PUBLICATION_MODAL_KEY,
  PublicationModal,
} from "components/PublicationModal";
import PublicationSearch from "components/PublicationSearch";
import SignInButton from "components/SignInButton";
import SignOutButton from "components/SignOutButton";
import { isString } from "lodash";
import { Publication } from "modules/publication";
import { User } from "modules/users";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";

const Miscelaneous: FC = () => {
  const count = Publication.STORE.useIndexCount() || 0;
  return (
    <nav className="flex items-center justify-center gap-3 text-sm text-indigo-700">
      <span className="border-b grow h-fit" />
      <span>
        <Counter value={count} /> publications registered so far
      </span>
      <Dot className="size-1" />
      <Anchor query={`${LEARN_MORE_MODAL_KEY}=true`}>Learn More</Anchor>
      <Dot className="size-1" />
      <Anchor query={`${CONTACT_MODAL_KEY}=true`}>Contact Us</Anchor>

      <span className="border-b grow h-fit" />
    </nav>
  );
};

const Home: NextPage = () => {
  const index = Publication.REMOTE.useIndex();
  const reset = Publication.STORE.useResetAll();
  const isAuthenticated = User.useIsAuthenticated();

  const router = useRouter();
  const { search } = router.query;
  const { isReady } = router;

  useEffect(() => reset(), [reset]);

  useEffect(() => {
    if (isReady) {
      index({ search: isString(search) ? search : undefined });
    }
  }, [reset, index, search, isReady]);

  const modal = useURLQueryModal(PUBLICATION_MODAL_KEY);

  function handleRowClick(id: number) {
    return () => modal.open(`${id}`);
  }

  return (
    <Layout
      title="Richard Burton"
      content={
        <>
          <div className="hidden sm:block">
            <PublicationIndexTable onRowClick={handleRowClick} />
          </div>
          <div className="sm:hidden">
            <PublicationIndexList onItemClick={handleRowClick} />
          </div>
          <PublicationModal />
        </>
      }
      leftAside={<PublicationHiddenAttributes />}
      subheader={
        <div className="py-4 space-y-2">
          <Miscelaneous />
          <PublicationSearch />
        </div>
      }
      footer={
        <div className="flex flex-col justify-center gap-2 sm:justify-start sm:flex-row sm:items-start">
          {isAuthenticated ? (
            <div className="flex gap-2">
              <PublicationDownload />
              <Link href="/publications/new">
                <Button
                  label="Add publications"
                  variant="outline"
                  Icon={AddIcon}
                  alignment="left"
                  width="fixed"
                />
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <div className="hidden sm:block">
              <SignInButton />
            </div>
          )}

          <ContactModal />
          <LearnMoreModal />
        </div>
      }
    />
  );
};

export default Home;
