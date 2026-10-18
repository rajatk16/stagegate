export type OrganizationPermission =
  | 'organization:read'
  | 'organization:update'
  | 'organization:audit:read'
  | 'organization:members:read'
  | 'organization:members:manage'
  | 'organization:ownership:transfer';
