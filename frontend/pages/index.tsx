import AddIcon from "assets/add.svg";
import Button from "components/Button";
import { IndexCounter } from "components/IndexCounter";
import Layout from "components/Layout";
import { LearnMoreButton } from "components/LearnMoreButton";
import { useURLQueryModal } from "components/Modal";
import PublicationDownload from "components/PublicationDownload";
import PublicationHiddenAttributes from "components/PublicationHiddenAttributes";
import PublicationIndex from "components/PublicationIndex";
import { PublicationModal } from "components/PublicationModal";
import PublicationSearch from "components/PublicationSearch";
import SignInButton from "components/SignInButton";
import SignOutButton from "components/SignOutButton";
import StrikeHeading from "components/StrikeHeading";
import { isString } from "lodash";
import { Publication } from "modules/publication";
import { User } from "modules/users";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home: NextPage = () => {
  const index = Publication.REMOTE.useIndex();
  const reset = Publication.STORE.useResetAll();
  const isAuthenticated = User.useIsAuthenticated();
  const count = Publication.STORE.useIndexCount();

  const router = useRouter();
  const { search } = router.query;
  const { isReady } = router;

  useEffect(() => reset(), [reset]);

  useEffect(() => {
    if (isReady) {
      index({ search: isString(search) ? search : undefined });
    }
  }, [reset, index, search, isReady]);

  const modal = useURLQueryModal("publication");

  function handleRowClick(id: number) {
    return () => modal.open(`${id}`);
  }

  return (
    <Layout
      title="Richard Burton"
      content={
        <>
          <PublicationIndex onRowClick={handleRowClick} />
          <PublicationModal />
        </>
      }
      leftAside={<PublicationHiddenAttributes />}
      subheader={
        <div className="flex flex-col space-y-2">
          <StrikeHeading label="Browse data about Brazilian literary books translated to English" />
          <PublicationSearch />
        </div>
      }
      footer={
        <div className="flex gap-2">
          <IndexCounter count={count} />
          {isAuthenticated ? (
            <div className="flex gap-2">
              <PublicationDownload />
              <Link href="/publications/new">
                <Button
                  label="Add publications"
                  type="outline"
                  Icon={AddIcon}
                  alignment="left"
                  width="fixed"
                />
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <SignInButton />
          )}
          <div className="ml-auto">
            <LearnMoreButton />
          </div>
        </div>
      }
    />
  );
};

export default Home;
