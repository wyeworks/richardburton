import { snakeCase } from "lodash";
import { Publication } from "modules/publications";
import { useRouter } from "next/router";
import { FC, useRef } from "react";
import { FILES_URL, request } from "app";
import DownloadIcon from "assets/download.svg";
import Button from "./Button";
import qs from "qs";

const PublicationDownload: FC = () => {
  const visibleCount = Publication.STORE.useVisibleCount();
  const visibleAttributes = Publication.STORE.ATTRIBUTES.useVisible();

  const router = useRouter();

  const anchor = useRef<HTMLAnchorElement>(null);

  const { search } = router.query;

  const download = () => {
    request(async (http) => {
      if (anchor.current) {
        const query = qs.stringify(
          {
            search,
            select: visibleAttributes.map(snakeCase),
          },
          { encode: false }
        );

        const { data, headers } = await http.get(
          `${FILES_URL}/publications?${query}`,
          { responseType: "blob" }
        );

        const filename = /filename[^;=\n]*=([^;\n]*)/
          .exec(headers.contentDisposition)![1]
          .replace(/"/g, "");

        anchor.current.href = URL.createObjectURL(data);
        anchor.current.download = filename;
        anchor.current.click();
      }
    });
  };

  return (
    <>
      <Button
        label="Download .csv"
        type="outline"
        alignment="left"
        Icon={DownloadIcon}
        disabled={visibleCount === 0}
        onClick={download}
        width="fixed"
      />
      <a className="hidden" ref={anchor} />
    </>
  );
};

export default PublicationDownload;
