import { ChangeEventHandler, FC, useEffect, useRef, useState } from "react";
import UploadIcon from "assets/upload.svg";
import Router from "next/router";
import { API } from "app";
import { atom, useResetRecoilState, useSetRecoilState } from "recoil";
import { Publication } from "types";
import { useNotifyError } from "./Errors";
import axios from "axios";

const ERROR_MESSAGES: Record<string, string> = {
  incorrect_row_length: "Expected a different number of columns in csv",
  invalid_format: "Could not parse publications from the provided file",
};

const publicationsAtom = atom<Publication[] | undefined>({
  key: "publications",
  default: undefined,
});

const PublicationUpload: FC = () => {
  const resetPublications = useResetRecoilState(publicationsAtom);
  const setPublications = useSetRecoilState(publicationsAtom);
  const notifyError = useNotifyError();

  const [key, setKey] = useState(1);

  const handleChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files) {
      const [file] = event.target.files;

      const data = new FormData();
      data.append("csv", file);

      try {
        const { data: parsed } = await API.post("publications/parse", data);
        setPublications(parsed);

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
  };

  useEffect(() => resetPublications(), []);

  return (
    <label className="flex flex-col items-center justify-center h-40 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200">
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
export { publicationsAtom };
