export type TUserSettings = {
  username: string;
  // Not all devices have input available
  audioinput?: string;
  // Not all devices allow choosing output
  audiooutput?: string;
};
