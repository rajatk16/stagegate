import { UserProfileDocument } from "./userProfileDocument.type";

export type UserProfileUpdateDocument = 
  Pick<UserProfileDocument, 'updatedAt'> & 
  Partial<Pick<UserProfileDocument, 
    'displayName' | 
    'photoURL' | 
    'biography' | 
    'affiliation' | 
    'timezone'
  >>;
