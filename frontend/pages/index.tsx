import { NextPage } from "next";
import { useEffect } from "react";
import { Publication } from "modules/publication";
import Layout from "components/Layout";
import PublicationIndex from "components/PublicationIndex";
import PublicationSearch from "components/PublicationSearch";
import { useRouter } from "next/router";
import { isString } from "lodash";
import PublicationDownload from "components/PublicationDownload";
import SignOutButton from "components/SignOutButton";
import SignInButton from "components/SignInButton";
import { User } from "modules/users";
import StrikeHeading from "components/StrikeHeading";
import Button from "components/Button";
import AddIcon from "assets/add.svg";
import Link from "next/link";
import PublicationHiddenAttributes from "components/PublicationHiddenAttributes";

const Home: NextPage = () => {
  const index = Publication.REMOTE.useIndex();
  const reset = Publication.STORE.useResetAll();
  const router = useRouter();
  const isAuthenticated = User.useIsAuthenticated();

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
        <div className="space-y-2">
          <StrikeHeading label="Browse data about Brazilian literary books translated to English" />
          <PublicationSearch />
        </div>
      }
      footer={
        <div className="flex space-x-2">
          {isAuthenticated ? (
            <>
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
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      }
    />
  );
};

export default Home;
