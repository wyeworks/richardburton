import { NextPage } from "next";
import { useEffect } from "react";
import { Publication } from "modules/publications";
import Header from "components/Header";
import Layout from "components/Layout";
import PublicationIndex from "components/PublicationIndex";
import PublicationSearch from "components/PublicationSearch";
import { useRouter } from "next/router";
import { isString } from "lodash";
import PublicationFilter from "components/PublicationFilter";
import PublicationDownload from "components/PublicationDownload";
import SignOutButton from "components/SignOutButton";
import SignInButton from "components/SignInButton";
import { User } from "modules/users";
import ToolbarHeading from "components/ToolbarHeading";
import Button from "components/Button";
import AddIcon from "assets/add.svg";
import Link from "next/link";

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
      header={<Header />}
      content={<PublicationIndex />}
      subheader={
        <div className="space-y-2">
          <ToolbarHeading label="Browse data about Brazilian literary books translated to English" />
          <PublicationFilter />
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
