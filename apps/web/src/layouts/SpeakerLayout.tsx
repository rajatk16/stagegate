import { paths } from '@/app/router/paths';
import { speakerNavigation } from '@/components/navigation/navigationConfig';
import { WorkspaceShell } from '@/components/navigation/WorkspaceShell';

export const SpeakerLayout = () => (
  <WorkspaceShell
    title="Speaker workspace"
    navigation={speakerNavigation}
    homePath={paths.app.root}
    alternatePortal={{
      label: 'Organization portal',
      to: paths.app.root,
    }}
  />
);
