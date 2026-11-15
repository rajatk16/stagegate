import { Inject } from '@nestjs/common';

import { FIREBASE_AUTH } from '../constants/firebase.constants';

export const InjectFirebaseAuth = () => Inject(FIREBASE_AUTH);
