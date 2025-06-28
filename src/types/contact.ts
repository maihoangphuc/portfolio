export type SocialLinkType = {
  icon: React.ElementType;
  href: string;
  target?: string;
  name: string;
};

export type ContactType = {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href: string;
  isPrimary: boolean;
};

export type FormContactType = {
  name: string;
  email: string;
  message: string;
};
