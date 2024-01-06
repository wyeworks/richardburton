import AddIcon from "assets/add.svg";
import Button from "components/Button";
import { Counter } from "components/Counter";
import Layout from "components/Layout";
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

  useEffect(() => reset(), [reset]);

  useEffect(() => {
    const { search } = router.query;
    if (router.isReady) {
      index({ search: isString(search) ? search : undefined });
    }
  }, [reset, index, router]);

  return (
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
        <div className="flex justify-between gap-2">
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
          {count && (
            <Tooltip info message="Learn more.">
              <button className="flex items-center gap-1 px-2 text-white transition-colors bg-indigo-600 rounded shadow hover:bg-indigo-700">
                <Counter value={count} />
                <span>publications registered so far.</span>
              </button>
            </Tooltip>
          )}
        </div>
      }
    />
  );
};

export default Home;
