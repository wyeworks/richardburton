import { FC } from "react";
import Button from "./Button";
import { useURLQueryModal } from "./Modal";

const LearnMoreButton: FC = () => {
  const modal = useURLQueryModal("learn-more");

  return (
    <Button
      type="outline"
      label="Learn more about the Richard Burton Platform here"
      onClick={() => modal.open()}
    />
  );
};

export { LearnMoreButton };
