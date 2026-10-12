export type AcceptanceProblem = {
  kind:
    | 'wrong-account'
    | 'verify-email'
    | 'sign-in'
    | 'already-member'
    | 'unavailable'
    | 'retry';
  message: string;
};
