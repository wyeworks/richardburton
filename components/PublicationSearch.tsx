import { isString } from "lodash";
import { useRouter } from "next/router";
import { ChangeEventHandler, FC, useEffect, useState } from "react";

const PublicationSearch: FC = () => {
  const router = useRouter();

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
    <input
      className="w-full p-2 bg-gray-100 rounded shadow-sm outline-none focus:shadow placeholder:text-sm focus:bg-white/50 hover:bg-white/50"
      placeholder="Search publications"
      aria-label="Search publications"
      value={search}
      onChange={handleChange}
    />
  );
};

export default PublicationSearch;
