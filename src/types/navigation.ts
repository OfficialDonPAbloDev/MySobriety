// Navigation type definitions for the app
// These will be expanded as we add more screens

export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  '(modals)': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'forgot-password': undefined;
};

export type TabsParamList = {
  index: undefined;
  'check-in': undefined;
  resources: undefined;
  profile: undefined;
};

export type ModalsParamList = {
  'set-sobriety-date': undefined;
};
