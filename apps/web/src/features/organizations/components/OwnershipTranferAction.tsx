import { User } from 'firebase/auth';
import { useEffect, useId, useRef, useState } from 'react';

import { ConfirmDialog, Input } from '@/components';

import { reauthenticateOwner } from '../utils';
import { Organization, OrganizationMember } from '../types';
import {
  getOwnershipTransferError,
  transferOrganizationOwnership,
} from '../services';
import { queryKeys, useApiMutation } from '@/app/query';

type Props = {
  user: User;
  organization: Organization;
  member: OrganizationMember;
  disabled: boolean;
  onPendingChange: (pending: boolean) => void;
  onSuccess: () => void;
  restoreFocus: () => void;
};

export const OwnershipTranferAction = (props: Props) => {
  const passwordId = useId();
  const passwordRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  const transferMutation = useApiMutation({
    user: props.user,
    request: transferOrganizationOwnership,
    affected: [
      queryKeys.organizations(props.user.uid),
      queryKeys.organization(props.user.uid, props.organization.id),
    ],
    onSuccess: () => {
      props.onSuccess();
    },
  });

  const [error, setError] = useState('');
  const [requiresRefresh, setRequiresRefresh] = useState(false);

  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );

  const person =
    props.member.displayName ?? props.member.email ?? 'this member';

  const supportsPassword = props.user.providerData.some(
    (provider) => provider.providerId === 'password',
  );

  const confirm = async () => {
    if (requiresRefresh) {
      throw new Error('Refresh access before retrying.');
    }

    const password = passwordRef.current?.value ?? '';

    if (!password) {
      setError('Enter your current password.');
      passwordRef.current?.focus();
      throw new Error('Password required.');
    }

    if (passwordRef.current) {
      passwordRef.current.value = '';
    }

    const controller = new AbortController();
    requestRef.current = controller;

    let submitted = false;
    setError('');
    props.onPendingChange(true);

    try {
      await reauthenticateOwner(props.user, password, controller.signal);

      controller.signal.throwIfAborted();

      submitted = true;

      await transferMutation.execute(
        props.organization.id,
        props.member.uid,
        controller.signal,
      );

      controller.signal.throwIfAborted();
    } catch (cause: unknown) {
      if (!controller.signal.aborted) {
        setError(getOwnershipTransferError(cause, submitted));

        if (submitted) {
          setRequiresRefresh(true);
        }
      }

      throw cause;
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (!controller.signal.aborted) {
        props.onPendingChange(false);
      }
    }
  };

  if (!props.member.actions.transferOwnership) return null;

  if (!supportsPassword) {
    return (
      <p className="max-w-xs text-sm text-muted-foreground">
        Ownership transfer currently supports password accounts.
      </p>
    );
  }

  return (
    <ConfirmDialog
      triggerLabel="Transfer ownership"
      title={`Transfer ownership to ${person}?`}
      description={
        `${person} will become an owner of ${props.organization.name}. ` +
        `Your role will change from Owner to Admin. ` +
        `You will remain a member, but will lose owner-only actions. ` +
        `You cannot undo this yourself after the transfer.`
      }
      confirmLabel="Confirm and transfer ownership"
      pendingLabel="Verifying and transferring…"
      destructive
      disabled={props.disabled || requiresRefresh}
      restoreFocus={props.restoreFocus}
      errorMessage={
        requiresRefresh
          ? `${error} Close this dialog and use Refresh access before continuing.`
          : error
      }
      onConfirm={confirm}
    >
      <div className="mt-5 space-y-2">
        <p className="text-sm text-muted-foreground">
          Confirm your identity as {props.user.email}.
        </p>

        <label htmlFor={passwordId} className="block text-sm font-medium">
          Your current password
        </label>

        <Input
          ref={passwordRef}
          id={passwordId}
          type="password"
          autoComplete="current-password"
          disabled={props.disabled || requiresRefresh}
          className="min-h-11"
        />

        {props.member.displayName && props.member.email && (
          <p className="break-all text-sm text-muted-foreground">
            New owner: {props.member.email}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
};
