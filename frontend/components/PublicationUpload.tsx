import { ChangeEvent, FC, useEffect, useState } from "react";
import UploadIcon from "assets/upload.svg";
import Router from "next/router";
import { API } from "app";
import { useNotifyError } from "./Errors";
import axios from "axios";
import { Publication, PublicationEntry } from "modules/publications";
import { useRecoilCallback } from "recoil";
import { range } from "lodash";

const ERROR_MESSAGES: Record<string, string> = {
  incorrect_row_length: "Expected a different number of columns in csv",
  invalid_format: "Could not parse publications from the provided file",
};

const PublicationUpload: FC = () => {
  const notifyError = useNotifyError();
  const setPublications = Publication.STORE.useSetAll();
  const resetPublications = Publication.STORE.useResetAll();

  const [key, setKey] = useState(1);

  const handleChange = useRecoilCallback(
    ({ snapshot, set }) =>
      async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
          const [file] = event.target.files;

          const data = new FormData();
          data.append("csv", file);

          try {
            const { data: parsed } = await API.post<
              Omit<PublicationEntry, "id">[]
            >("publications/validate", data);

            const ids = range(0, parsed.length);

            setPublications(
              ids,
              parsed.map(({ publication, errors }, index) => ({
                id: ids[index],
                publication,
                errors,
              }))
            );

            Router.push("publications/new");
          } catch (error) {
            event.target.files = null;
            setKey((key) => -key);
            if (axios.isAxiosError(error)) {
              const { response, message } = error;
              notifyError(
                (response && ERROR_MESSAGES[response.data as string]) || message
              );
            }
          }
        }
      },
    []
  );

  useEffect(() => resetPublications(), [resetPublications]);

  return (
    <label className="flex flex-col items-center justify-center w-40 h-40 text-sm rounded-lg shadow-sm cursor-pointer hover:bg-gray-200">
      Upload .csv
      <UploadIcon className="w-8 h-8 text-indigo-800" />
      <input
        key={key}
        type="file"
        id="upload-csv"
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
};

export default PublicationUpload;
