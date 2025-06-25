"use client";

import SectionContainer from "@/components/SectionContainer";
import emailjs from "@emailjs/browser";
import { Box, Button, FormControl, Stack, TextField } from "@mui/material";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { validateField } from "@/utils/validation";
import { FormContact } from "@/types/project";
import { contacts } from "@/mockdata";

const ContactSection = () => {
  const { showSuccess, showError, showWarning } = useToast();

  const [activeContact, setActiveContact] = useState<string>("Email");

  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState<FormContact>({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string[] }>({
    name: [],
    email: [],
    message: [],
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string);
  }, []);

  const validateFormField = (name: string, value: string) => {
    const fieldErrors = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors,
    }));
    return fieldErrors.length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateFormField(name, value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nameValid = validateFormField("name", form.name);
    const emailValid = validateFormField("email", form.email);
    const messageValid = validateFormField("message", form.message);

    if (!nameValid || !emailValid || !messageValid) {
      if (!nameValid && nameRef.current) {
        nameRef.current.focus();
      } else if (!emailValid && emailRef.current) {
        emailRef.current.focus();
      } else if (!messageValid && messageRef.current) {
        messageRef.current.focus();
      }

      showWarning("Please enter all fields", {
        className: "!text-black",
      });
      return;
    }

    setLoading(true);

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
        {
          from_name: form.name,
          to_name: "Phuc",
          from_email: form.email,
          to_email: process.env.NEXT_PUBLIC_RECIPIENT_EMAIL as string,
          message: form.message,
        }
      )
      .then(() => {
        setLoading(false);
        showSuccess("Message sent successfully");
        setForm({ name: "", email: "", message: "" });
        setErrors({ name: [], email: [], message: [] });
      })
      .catch((error) => {
        setLoading(false);
        showError("Failed to send message. Please try again.");
        console.log(error);
      });
  };

  const handleContactClick = (contact: { title: string; href: string }) => {
    setActiveContact(contact.title);
    if (contact.href) {
      if (contact.title === "Messenger") {
        window.open(contact.href, "_blank");
      } else {
        window.location.href = contact.href;
      }
    }
  };

  return (
    <SectionContainer
      sectionId="contact"
      title="Contact"
      titleDescription="Get in touch"
      showWave={{ top: false, bottom: false }}
      className="!flex !flex-col !min-h-[600px]"
      classChildren="!py-12"
    >
      <Box
        className={clsx(
          "!flex !flex-col !gap-8 md:!flex-row",
          "!w-full !max-w-3xl !justify-center",
          "!items-start !justify-start"
        )}
      >
        <Box className="!w-full !flex-wrap md:!w-[40%] !flex !flex-row md:!flex-col !gap-4">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            const isActive = activeContact === contact.title;
            return (
              <Box
                key={index}
                onClick={() => handleContactClick(contact)}
                className={clsx(
                  "!p-6",
                  "!size-full xs:!w-[150px] md:!w-full",
                  "!rounded-xl",
                  isActive
                    ? "!bg-light-primary dark:!bg-dark-primary"
                    : "!bg-transparent",
                  "!cursor-pointer",
                  "!border !border-light-divider dark:!border-dark-divider",
                  isActive
                    ? "!border-light-primary dark:!border-dark-primary"
                    : "!border-gray-700",
                  "hover:!border-light-primary dark:hover:!border-dark-primary"
                )}
              >
                <Stack spacing={0.5} alignItems="center">
                  <Icon
                    className={clsx(
                      "!text-xl !mb-1",
                      isActive
                        ? "!text-white"
                        : "!text-light-primary dark:!text-dark-primary"
                    )}
                  />
                  <div
                    className={clsx(
                      "!text-[15px] !font-medium",
                      isActive
                        ? "!text-white/90"
                        : "!text-light-primary/90 dark:!text-dark-primary/90"
                    )}
                  >
                    {contact.title}
                  </div>
                  <div
                    className={clsx(
                      "!text-[13px]",
                      isActive
                        ? "!text-white/80"
                        : "!text-light-text-primary/80 dark:!text-dark-text-primary/80"
                    )}
                  >
                    {contact.subtitle}
                  </div>
                </Stack>
              </Box>
            );
          })}
        </Box>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="!w-full !flex !flex-col !gap-4 !justify-center !items-center md:!items-start md:!justify-start"
        >
          <FormControl fullWidth error={errors.name.length > 0}>
            <TextField
              inputRef={nameRef}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Your Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name.length > 0}
              helperText={errors.name[0]}
              className="!bg-transparent !rounded-md !w-full"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "var(--color-light-divider)",
                  },
                  "&:hover fieldset": {
                    borderColor: "var(--color-light-primary)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--color-light-primary)",
                  },
                  ".dark &": {
                    "& fieldset": {
                      borderColor: "var(--color-dark-divider)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--color-dark-primary)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-dark-primary)",
                    },
                  },
                },
              }}
            />
          </FormControl>

          <FormControl fullWidth error={errors.email.length > 0}>
            <TextField
              inputRef={emailRef}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Your Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email.length > 0}
              helperText={errors.email[0]}
              className="!bg-transparent !rounded-md !w-full"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "var(--color-light-divider)",
                  },
                  "&:hover fieldset": {
                    borderColor: "var(--color-light-primary)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--color-light-primary)",
                  },
                  ".dark &": {
                    "& fieldset": {
                      borderColor: "var(--color-dark-divider)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--color-dark-primary)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-dark-primary)",
                    },
                  },
                },
              }}
            />
          </FormControl>

          <FormControl fullWidth error={errors.message.length > 0}>
            <TextField
              inputRef={messageRef}
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              placeholder="Your Message"
              name="message"
              value={form.message}
              onChange={handleChange}
              error={errors.message.length > 0}
              helperText={errors.message[0]}
              className="!bg-transparent !rounded-md !w-full"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "var(--color-light-divider)",
                  },
                  "&:hover fieldset": {
                    borderColor: "var(--color-light-primary)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--color-light-primary)",
                  },
                  ".dark &": {
                    "& fieldset": {
                      borderColor: "var(--color-dark-divider)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--color-dark-primary)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-dark-primary)",
                    },
                  },
                },
              }}
            />
          </FormControl>

          <Button
            type="submit"
            variant="outlined"
            disabled={loading}
            className={clsx(
              "!bg-light-primary dark:!bg-dark-primary hover:!bg-light-primary/80 dark:hover:!bg-dark-primary/80",
              "!text-white",
              "!font-regular",
              "!w-fit",
              "!rounded-md",
              "!text-base",
              "!border-none",
              "!capitalize",
              "!hover:border-primary",
              loading && "!opacity-70"
            )}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Box>
    </SectionContainer>
  );
};

export default ContactSection;
