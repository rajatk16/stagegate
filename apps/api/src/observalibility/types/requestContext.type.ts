export interface RequestContext {
  requestId: string;
  actorUid?: string;
  errorCode?: string;
  errorKind?: 'application' | 'http' | 'unexpected';
}
