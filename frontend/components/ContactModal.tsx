import { FC, FormEvent } from "react";
import { useForm } from "utils/useForm";
import { z } from "zod";
import { Article } from "./Article";
import Button from "./Button";
import { Modal, useURLQueryModal } from "./Modal";
import { useNotify } from "./Notifications";
import TextArea from "./TextArea";
import TextInput from "./TextInput";

const CONTACT_MODAL_KEY = "contact";

const Contact = z.object({
  name: z.string().min(1, "Required"),
  institution: z.string().optional(),
  address: z.string().min(1, "Required"),
  subject: z.string().min(1, "Required"),
  message: z.string().min(1, "Required"),
});

type Contact = z.infer<typeof Contact>;

const SENDER_INTRODUCTION = `Please share your contact details to enable us to address your query promptly. Your full name and email address are essential for us to send you a response. If you're associated with an institution and you think it's relevant to your message, feel free to include that information as well, though it's completely optional. We assure you that your details will be kept confidential and used solely for communication purposes related to your inquiry.`;
const MESSAGE_INTRODUCTION = `Kindly provide a concise description of your purpose for reaching out. Whether you're interested in collaborating with our research, offering feedback on our data, or sharing insights about our web application, we invite you to outline your thoughts succinctly. This initial communication is an important step in establishing a productive dialogue. We're committed to understanding your perspective and exploring how we can effectively respond or engage in further discussions.`;

const ContactForm: FC = () => {
  const { close } = useURLQueryModal(CONTACT_MODAL_KEY);
  const notify = useNotify();

  const [contact, setContact, errors] = useForm(Contact);

  const {
    name = "",
    institution = "",
    subject = "",
    address = "",
    message = "",
  } = contact;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { success } = Contact.safeParse(contact);

    if (!success) {
      setContact({
        name,
        institution,
        subject,
        address,
        message,
      });
      return;
    }

    notify({
      level: "success",
      message: "Your message has been sent!",
    });

    close();
  }

  function handleChange(key: keyof Contact) {
    return (value: string) => {
      setContact({ ...contact, [key]: value });
    };
  }

  return (
    <form
      className="py-4 space-y-5 text-sm sm:text-base"
      onSubmit={handleSubmit}
    >
      <section className="space-y-6">
        <p>{SENDER_INTRODUCTION}</p>
        <fieldset className="space-y-6">
          <TextInput
            label="Name"
            value={name}
            onChange={handleChange("name")}
            error={errors.name}
          />
          <TextInput
            label="Email"
            value={address}
            onChange={handleChange("address")}
            error={errors.address}
          />
          <TextInput
            label="Institution"
            value={institution}
            onChange={handleChange("institution")}
            error={errors.institution}
          />
        </fieldset>
      </section>

      <section className="space-y-6">
        <p>{MESSAGE_INTRODUCTION}</p>
        <fieldset className="space-y-6">
          <TextInput
            label="Subject"
            value={subject}
            onChange={handleChange("subject")}
            error={errors.subject}
          />
          <TextArea
            label="Write your message here..."
            value={message}
            onChange={handleChange("message")}
            error={errors.message}
          />
        </fieldset>
      </section>

      <footer className="flex justify-end gap-2">
        <Button label="Cancel" variant="outline" onClick={close} />
        <Button type="submit" label="Send" />
      </footer>
    </form>
  );
};

const ContactModal: FC = () => {
  const { isOpen, close } = useURLQueryModal(CONTACT_MODAL_KEY);
  return (
    <Modal isOpen={isOpen} onClose={close}>
      <Article heading={<div>Contact Us</div>} content={<ContactForm />} />
    </Modal>
  );
};

export { CONTACT_MODAL_KEY, ContactModal };
