export const knownCodes = new Map<string | number, string>([
  ['EADDRINUSE', 'PORT_IN_USE'],
  ['EACCES', 'ACCESS_DENIED'],
  ['ENOENT', 'FILE_NOT_FOUND'],
  ['ENOTFOUND', 'DNS_LOOKUP_FAILED'],
  ['ECONNREFUSED', 'CONNECTION_REFUSED'],
  ['ECONNRESET', 'CONNECTION_RESET'],
  ['ETIMEDOUT', 'NETWORK_TIMEOUT'],

  ['app/invalid-credential', 'FIREBASE_CREDENTIAL_INVALID'],
  ['auth/invalid-credential', 'FIREBASE_CREDENTIAL_INVALID'],
  ['auth/insufficient-permission', 'FIREBASE_PERMISSION_DENIED'],
  ['app/network-error', 'FIREBASE_NETWORK_ERROR'],
  ['auth/internal-error', 'FIREBASE_AUTH_INTERNAL_ERROR'],

  // Firestore/gRPC status codes.
  [4, 'DEPENDENCY_DEADLINE_EXCEEDED'],
  [7, 'DEPENDENCY_PERMISSION_DENIED'],
  [8, 'DEPENDENCY_RESOURCE_EXHAUSTED'],
  [14, 'DEPENDENCY_UNAVAILABLE'],
  [16, 'DEPENDENCY_UNAUTHENTICATED'],
]);
