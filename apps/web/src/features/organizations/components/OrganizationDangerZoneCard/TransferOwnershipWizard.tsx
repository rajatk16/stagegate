import { useMemo, useState } from 'react';
import type { OrganizationMember } from '../../types';
import { Button } from '@/components/ui';
import { OrganizationMemberPicker } from '../OrganizationMemberPicker';

type TransferOwnershipWizardStep = 'select-member' | 'review';

interface TransferOwnershipWizardProps {
  loading?: boolean;
  members: OrganizationMember[];
  currentOwner: OrganizationMember;

  onCancel: () => void;
  onTransfer?: (member: OrganizationMember) => Promise<void>;
}

export const TransferOwnershipWizard = ({
  loading = false,
  ...props
}: TransferOwnershipWizardProps) => {
  const [step, setStep] =
    useState<TransferOwnershipWizardStep>('select-member');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const eligibleMembers = useMemo(
    () => props.members.filter((member) => member.id !== props.currentOwner.id),
    [props.members, props.currentOwner.id],
  );

  const selectedMember = useMemo(
    () =>
      eligibleMembers.find((member) => member.id === selectedMemberId) ?? null,
    [eligibleMembers, selectedMemberId],
  );
  const currentStep = selectedMember ? step : 'select-member';
  const canContinue = selectedMember !== null;

  const handleContinue = () => {
    if (!canContinue) return;

    setStep('review');
  };

  const handleBack = () => {
    setStep('select-member');
  };

  if (currentStep === 'review') {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold">Review</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Review step will be implemented in the next step.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>

          <Button disabled>Transfer Ownership</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizationMemberPicker
        members={eligibleMembers}
        selectedMemberId={selectedMember?.id}
        loading={loading}
        onSelect={(member) => setSelectedMemberId(member.id)}
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={props.onCancel} disabled={loading}>
          Cancel
        </Button>

        <Button disabled={loading || !canContinue} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};
