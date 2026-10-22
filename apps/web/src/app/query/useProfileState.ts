import { getProfileErrorMessage, Profile } from '@/features/profile/services';
import { User } from 'firebase/auth';
import { useProfileQuery } from './resources';
import { isAccessError } from './client';

type ProfileState =
  | {
      status: 'loading';
    }
  | {
      status: 'error';
      message: string;
    }
  | {
      status: 'ready';
      profile: Profile;
    };

export const useProfileState = (user: User) => {
  const query = useProfileQuery(user);

  let state: ProfileState;

  if (
    isAccessError(query.error) ||
    (query.isError && query.data === undefined)
  ) {
    state = {
      status: 'error',
      message: getProfileErrorMessage(query.error),
    };
  } else if (query.data !== undefined) {
    state = {
      status: 'ready',
      profile: query.data,
    };
  } else {
    state = {
      status: 'loading',
    };
  }

  return {
    state,
    refreshing: query.isFetching,
    refreshError:
      query.error && query.data !== undefined && !isAccessError(query.error)
        ? getProfileErrorMessage(query.error)
        : null,
    refresh: () => {
      void query.refetch();
    },
  };
};
