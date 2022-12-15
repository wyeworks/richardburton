import { ChangeEventHandler, FC, useEffect } from "react";
import UploadIcon from "assets/upload.svg";
import Router from "next/router";
import { API } from "app";
import { atom, useResetRecoilState, useSetRecoilState } from "recoil";
import { Publication } from "types";

const publicationsAtom = atom<Publication[] | undefined>({
  key: "publications",
  default: undefined,
});

const PublicationUpload: FC = () => {
  const resetPublications = useResetRecoilState(publicationsAtom);
  const setPublications = useSetRecoilState(publicationsAtom);

  const handleChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files) {
      const [file] = event.target.files;

      const data = new FormData();
      data.append("csv", file);
      const { data: parsed } = await API.post("publications/bulk", data);
      setPublications(parsed);

      Router.push("publications/new");
    }
  };

  useEffect(() => resetPublications());

  return (
    <label className="flex flex-col items-center justify-center h-40 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200">
      Upload .csv
      <UploadIcon className="w-8 h-8 text-indigo-800" />
      <input
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
