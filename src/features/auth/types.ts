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
