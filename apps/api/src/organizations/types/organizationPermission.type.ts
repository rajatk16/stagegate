export type OrganizationPermission =
  | 'organization:read'
  | 'organization:update'
  | 'organization:audit:read'
  | 'organization:events:read'
  | 'organization:members:read'
  | 'organization:events:create'
  | 'organization:members:manage'
  | 'organization:ownership:transfer'
  | 'organization:events:update'
  | 'organization:events:manage-status';
