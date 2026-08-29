export { RuntimeConfigModule } from './runtimeConfig/runtimeConfig.module';
export { ConfigurationValidationError } from './runtimeConfig/configurationValidation.error';
export {
  RuntimeConfigService,
  type RuntimeConfigOptions,
} from './runtimeConfig/runtimeConfg.service';

export { FirebaseAdminModule } from './firebaseAdmin/firebaseAdmin.module';
export {
  FIRESTORE,
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIREBASE_STORAGE,
} from './runtimeConfig/firebase.tokens';
