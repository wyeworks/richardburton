import { ChangeEventHandler, FC, useState } from "react";
import UploadIcon from "assets/upload.svg";
import { FlatPublication } from "types";

const PublicationUpload: FC = () => {
  const [, setUploadedPublications] = useState<FlatPublication[] | undefined>();

  const handleChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.files) {
      const [file] = event.target.files;

      setUploadedPublications(
        (await file.text())
          .split("\n")
          .map((row) => row.split(";"))
          .map(
            ([
              originalAuthors,
              year,
              country,
              originalTitle,
              title,
              authors,
              publisher,
            ]) => ({
              originalAuthors,
              year: parseInt(year),
              country,
              originalTitle,
              title,
              authors,
              publisher,
            })
          )
      );
    }
  };

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
