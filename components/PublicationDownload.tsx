import { isString } from "lodash";
import { Publication } from "modules/publications";
import { useRouter } from "next/router";
import { FC } from "react";
import DownloadIcon from "assets/download.svg";

const PublicationDownload: FC = () => {
  const visibleCount = Publication.STORE.useVisibleCount();
  const visibleAttributes = Publication.STORE.ATTRIBUTES.useVisible();

  const router = useRouter();

  const { search } = router.query;

  const params = new URLSearchParams();

  if (isString(search)) {
    params.set("search", search);
  }

  const camelCaseToSnakeCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  visibleAttributes
    .map(camelCaseToSnakeCase)
    .forEach((key) => params.append("select[]", key));

  const qs = params.toString();

  return (
    <>
      {visibleCount > 0 && (
        <a
          className="flex items-center px-2 py-1.5 text-xs transition-colors bg-gray-100 rounded shadow-sm cursor-pointer hover:bg-white/50 w-48"
          href={`${process.env.NEXT_PUBLIC_FILES_URL}/publications?${qs}`}
        >
          <DownloadIcon className="w-5 h-5 mr-2 text-indigo-700" />
          Download .csv
        </a>
      )}
    </>
  );
};

export default PublicationDownload;
