export interface Credentials {
  email: string;
  password: string;
}

export interface AccountProfile {
  title: 'Mr' | 'Mrs';
  birthDate: string;
  birthMonth: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobileNumber: string;
}

export interface RegisteredUser {
  name: string;
  credentials: Credentials;
  profile: AccountProfile;
}

/** Envelope returned by the automationexercise.com public API (always HTTP 200; real status lives in `responseCode`). */
export interface ApiResponse {
  responseCode: number;
  message: string;
}
