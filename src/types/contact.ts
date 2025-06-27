export type SocialLink = {
  icon: React.ElementType;
  href: string;
  target?: string;
  name: string;
};

export type Contact = {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href: string;
  isPrimary: boolean;
};
