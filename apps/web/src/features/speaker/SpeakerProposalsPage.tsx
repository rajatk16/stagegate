import { FileText } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';

export const SpeakerProposalsPage = () => (
  <div className="space-y-8">
    <PageHeader title="My proposals" description="Track and manage your conference submissions." />

    <EmptyState
      icon={FileText}
      title="Proposal submissions are not available yet"
      description="This workspace will support drafts, submitted proposals, review decisions and speaker confirmations."
    />
  </div>
);
