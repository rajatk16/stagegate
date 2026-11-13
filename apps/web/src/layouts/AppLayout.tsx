import { paths } from '@/app/router/paths';
import { appNavigation } from '@/components/navigation/navigationConfig';
import { WorkspaceShell } from '@/components/navigation/WorkspaceShell';

export const AppLayout = () => (
  <WorkspaceShell
    title="Organization workspace"
    navigation={appNavigation}
    homePath={paths.app.root}
    alternatePortal={{
      label: 'Speaker portal',
      to: paths.speaker.root,
    }}
  />
);
