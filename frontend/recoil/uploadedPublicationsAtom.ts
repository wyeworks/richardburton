import { atom } from "recoil";
import { FlatPublication } from "types";

export default atom<FlatPublication[] | undefined>({
  key: "uploadedPublicationsAtom",
  default: undefined,
});
