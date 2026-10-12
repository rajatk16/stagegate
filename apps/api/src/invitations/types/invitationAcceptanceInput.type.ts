export type InvitationAcceptanceInput = {
  invitationId: string;
  recipientUid: string;
  verifiedEmail: string;
  authorization:
    | {
        kind: 'email-link';
        token: string;
      }
    | {
        kind: 'verified-account';
      };
};
