export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface FieldValidation {
  [key: string]: ValidationRule[];
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validationRules: FieldValidation = {
  name: [
    {
      validate: (value: string) => value.length >= 1,
      message: "Name must be at least 1 characters long",
    },
    {
      validate: (value: string) => value.length <= 50,
      message: "Name must not exceed 50 characters",
    },
  ],
  email: [
    {
      validate: (value: string) => value.length > 0,
      message: "Email is required",
    },
    {
      validate: validateEmail,
      message: "Please enter a valid email address",
    },
  ],
  message: [
    {
      validate: (value: string) => value.length >= 10,
      message: "Message must be at least 10 characters long",
    },
    {
      validate: (value: string) => value.length <= 500,
      message: "Message must not exceed 500 characters",
    },
  ],
};

export const validateField = (fieldName: string, value: string): string[] => {
  const rules = validationRules[fieldName];
  if (!rules) return [];

  const errors: string[] = [];
  rules.forEach((rule) => {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  });

  return errors;
};
