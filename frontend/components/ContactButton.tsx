import { FC } from "react";
import Button from "./Button";
import { CONTACT_MODAL_KEY } from "./ContactModal";
import { useURLQueryModal } from "./Modal";

const ContactButton: FC = () => {
  const modal = useURLQueryModal(CONTACT_MODAL_KEY);

  return (
    <Button
      variant="secondary"
      label="Contact Us"
      onClick={() => modal.open()}
    />
  );
};

export { ContactButton };
