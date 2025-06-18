"use client";

import SectionContainer from "@/components/SectionContainer";
import { contacts } from "@/constants";
import emailjs from "@emailjs/browser";
import { Box, Button, FormControl, Stack, TextField } from "@mui/material";
import clsx from "clsx";
import { useRef, useState } from "react";

const ContactSection = () => {
  const form = useRef<HTMLFormElement>(null);
  const [activeContact, setActiveContact] = useState<string>("Email");

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

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.current) return;

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
        form.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string
      )
      .then(
        (result) => {
          console.log("SUCCESS!", result.text);
          // Reset form
          form.current?.reset();
        },
        (error) => {
          console.log("FAILED...", error.text);
        }
      );
  };

  return (
    <SectionContainer
      sectionId="contact"
      title="Contact"
      titleDescription="Get in touch"
      showWave={{ top: false, bottom: false }}
      className="!flex !flex-col !min-h-[950px] xs:!min-h-[750px] sm:!min-h-[650px] md:!min-h-[700px]"
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
                  isActive ? "!bg-primary" : "!bg-transparent",
                  "!cursor-pointer",
                  "!border !border-light-divider dark:!border-dark-divider",
                  isActive ? "!border-primary" : "!border-gray-700",
                  "!transition-all !duration-300",
                  "hover:!border-primary"
                )}
              >
                <Stack spacing={0.5} alignItems="center">
                  <Icon
                    className={clsx(
                      "!text-xl !mb-1",
                      isActive ? "!text-black/80" : "!text-primary"
                    )}
                  />
                  <div
                    className={clsx(
                      "!text-[15px] !font-medium",
                      isActive
                        ? "!text-black/70"
                        : "!text-light-text-primary dark:!text-dark-text-primary"
                    )}
                  >
                    {contact.title}
                  </div>
                  <div
                    className={clsx(
                      "!text-[13px]",
                      isActive
                        ? "!text-black/50"
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
          ref={form}
          onSubmit={sendEmail}
          className="!w-full !flex !flex-col !gap-4 !justify-center !items-center md:!items-start md:!justify-start"
        >
          <FormControl fullWidth>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Your Full Name"
              name="from_name"
              className="!bg-transparent !rounded-md input-hover !w-full"
              sx={{
                input: {
                  color: "var(--light-text-primary)",
                },
                ".MuiInputBase-root": {
                  "&.Mui-focused": {
                    color: "var(--light-text-primary)",
                  },
                },
              }}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Your Email"
              name="reply_to"
              className="!bg-transparent !rounded-md input-hover !w-full"
              sx={{
                input: {
                  color: "var(--light-text-primary)",
                },
                ".MuiInputBase-root": {
                  "&.Mui-focused": {
                    color: "var(--light-text-primary)",
                  },
                },
              }}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              placeholder="Your Message"
              name="message"
              className="!bg-transparent !rounded-md input-hover !w-full"
              sx={{
                textarea: {
                  color: "var(--light-text-primary)",
                },
                ".MuiInputBase-root": {
                  "&.Mui-focused": {
                    color: "var(--light-text-primary)",
                  },
                },
              }}
            />
          </FormControl>

          <Button
            type="submit"
            variant="outlined"
            className={clsx(
              "!bg-primary",
              "!text-black/70",
              "!font-medium",
              "!w-fit",
              "!rounded-md",
              "!text-base",
              "!border-none",
              "!capitalize",
              "!hover:border-primary"
            )}
          >
            Send Message
          </Button>
        </form>
      </Box>
    </SectionContainer>
  );
};

export default ContactSection;
