import { Inject } from '@nestjs/common';

import { FIRESTORE } from '../constants/firebase.constants';

export const InjectFirestore = () => Inject(FIRESTORE);
