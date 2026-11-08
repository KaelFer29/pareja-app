export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = SignInInput & {
  displayName: string;
};

export type SignUpResult = {
  needsEmailConfirmation: boolean;
};

export type ResetPasswordInput = {
  email: string;
};

export type UpdatePasswordInput = {
  password: string;
};

export type UpdateEmailInput = {
  email: string;
};
