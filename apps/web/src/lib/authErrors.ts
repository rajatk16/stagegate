import { FirebaseError } from "firebase/app"

export const getAuthErrorMessage = (error: unknown): string => {
  if (!(error instanceof FirebaseError)) {
    return "Something went wrong. Please try again.";
  }

  switch (error.code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account already uses this email. Try signing in.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "Your password does not meet the account requirements."
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect.";
    case "auth/user-disabled":
      return "This account is disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait before trying again.";

    case "auth/network-request-failed":
      return "Could not connect. Check your connection and try again.";

    case "auth/operation-not-allowed":
      return "Email and password authentication is unavailable right now.";
    case "auth/expired-action-code":
      return "This link has expired. Request a new email.";
    
    case "auth/invalid-action-code":
      return "This link is invalid or has already been used. Request a new email.";
    
    case "auth/requires-recent-login":
    case "auth/user-token-expired":
      return "Please sign out and sign in again to continue.";

    default:
      return "Could not complete your request. Please try again.";
  }
}
