import { isString } from "lodash";
import { Publication } from "modules/publications";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEventHandler, FC, useEffect, useState } from "react";

const PublicationSearch: FC = () => {
  const router = useRouter();
  const keywords = Publication.STORE.useKeywords();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (router.isReady) {
      const { search: searchUrlParam = "" } = router.query;
      setSearch((search) => {
        return isString(searchUrlParam) ? searchUrlParam : search;
      });
    }
  }, [router]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);

    router.replace(
      { query: e.target.value ? { search: e.target.value } : {} },
      undefined,
      { shallow: true }
    );
  };

  return (
    <section className="space-y-3">
      <input
        className="w-full p-2 bg-gray-100 rounded shadow-sm outline-none focus:shadow placeholder:text-sm focus:bg-white/50 hover:bg-white/50"
        placeholder="Search publications"
        aria-label="Search publications"
        value={search}
        onChange={handleChange}
      />
      <div className="h-4 px-2 space-x-1 text-xs truncate">
        {keywords && <span>Showing results for</span>}
        {keywords?.map((keyword, index) => (
          <span key={`search-keyword-${keyword}`}>
            <Link
              href={`?search=${keyword}`}
              className="text-indigo-600 underline hover:bg-indigo-300"
            >
              {keyword}
            </Link>
            {index < keywords.length - 1 ? "," : "."}
          </span>
        ))}
      </div>
    </section>
  );
};

export default PublicationSearch;
