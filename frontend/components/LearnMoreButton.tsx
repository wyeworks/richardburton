import { FC } from "react";
import Button from "./Button";
import { LEARN_MORE_MODAL_KEY } from "./LearnMoreModal";
import { useURLQueryModal } from "./Modal";

const LearnMoreButton: FC = () => {
  const modal = useURLQueryModal(LEARN_MORE_MODAL_KEY);

  return (
    <Button
      type="outline"
      label="Learn more about the Richard Burton Platform here"
      onClick={() => modal.open()}
    />
  );
};

export { LearnMoreButton };
