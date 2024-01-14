import AddIcon from "assets/add.svg";
import Button from "components/Button";
import { Counter } from "components/Counter";
import Layout from "components/Layout";
import { LearnMoreModal } from "components/LearnMoreModal";
import { useModal } from "components/Modal";
import PublicationDownload from "components/PublicationDownload";
import PublicationHiddenAttributes from "components/PublicationHiddenAttributes";
import PublicationIndex from "components/PublicationIndex";
import PublicationSearch from "components/PublicationSearch";
import SignInButton from "components/SignInButton";
import SignOutButton from "components/SignOutButton";
import StrikeHeading from "components/StrikeHeading";
import Tooltip from "components/Tooltip";
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
  const router = useRouter();
  const isAuthenticated = User.useIsAuthenticated();

  const count = Publication.STORE.useIndexCount();

  const learnMoreModal = useModal();

  useEffect(() => reset(), [reset]);

  useEffect(() => {
    const { search } = router.query;
    if (router.isReady) {
      index({ search: isString(search) ? search : undefined });
    }
  }, [reset, index, router]);

  return (
    <>
      <Layout
        title="Richard Burton"
        content={<PublicationIndex />}
        leftAside={<PublicationHiddenAttributes />}
        subheader={
          <div className="flex flex-col space-y-2">
            <StrikeHeading label="Browse data about Brazilian literary books translated to English" />
            <PublicationSearch />
          </div>
        }
        footer={
          <div className="flex gap-2">
            {count && (
              <Tooltip info message="Learn more.">
                <Button
                  label="publications registered so far"
                  aria-label={`${count} publications registered so far`}
                  onClick={learnMoreModal.open}
                  Icon={<Counter value={count} />}
                  width="fit"
                />
              </Tooltip>
            )}
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
              <Button
                type="outline"
                label="Learn more about the Richard Burton Platform here"
                onClick={learnMoreModal.open}
              />
            </div>
          </div>
        }
      />
      <LearnMoreModal
        isOpen={learnMoreModal.isOpen}
        onClose={learnMoreModal.close}
      />
    </>
  );
};

export default Home;
