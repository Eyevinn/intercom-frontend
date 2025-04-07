export type TUserSettings = {
  username?: string;
  // Not all devices have input available
  audioinput?: string | "no-device";
  // Not all devices allow choosing output
  audiooutput?: string;
};
