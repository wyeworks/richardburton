import { FC } from "react";
import UploadIcon from "assets/upload.svg";

const PublicationUpload: FC = () => {
  return (
    <label className="flex flex-col items-center justify-center h-40 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200">
      Upload .csv
      <UploadIcon className="w-8 h-8 text-indigo-800" />
      <input type="file" id="upload-csv" className="hidden" />
    </label>
  );
};

export default PublicationUpload;
