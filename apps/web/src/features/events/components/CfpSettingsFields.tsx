import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { InputField, TextareaField } from '@/components';

import { EventFormat } from '../types';
import { CFP_INSTRUCTIONS_MAX_LENGTH } from '../constants';
import { parseSubmissionLimit } from '../utils/eventCfpUtils';
import { isValidEventTimezone } from '../utils/eventTimeUtils';

type EventSettingsFormValues = {
  name: string;
  description: string;
  format: '' | EventFormat;
  location: string;

  startsAtLocal: string;
  endsAtLocal: string;
  timezone: string;

  submissionOpensAtLocal: string;
  submissionClosesAtLocal: string;
  submissionInstructions: string;
  maxSubmissionsPerPerson: string;
};

type Props = {
  register: UseFormRegister<EventSettingsFormValues>;
  errors: FieldErrors<EventSettingsFormValues>;
  timezone: string;
};

export const CfpSettingsFields = (props: Props) => {
  const zone = props.timezone.trim();

  return (
    <section
      aria-labelledby="event-cfp-heading"
      className="space-y-6 rounded-2xl border bg-card p-4 sm:p-6"
    >
      <div className="space-y-2">
        <h3 id="event-cfp-heading" className="text-lg font-semibold">
          Call for Proposals
        </h3>

        <p className="text-sm text-muted-foreground">
          Set the submission window, instructions, and limit per person.
        </p>
      </div>

      <div className="rounded-xl border bg-muted/40 p-4 text-sm">
        <p className="font-medium">
          Event timezone:{' '}
          <span className="font-mono">
            {isValidEventTimezone(zone)
              ? zone
              : 'Choose a valid timezone above'}
          </span>
        </p>

        <p className="mt-1 text-muted-foreground">
          Opening and deadline use the event timezone, regardless of your device
          timezone. The opening instant is included; the deadline is excluded.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <InputField
          id="event-cfp-opens-at"
          label="CFP opens (event time)"
          type="datetime-local"
          step={0.001}
          hint="Leave both dates blank to leave the window unconfigured."
          error={props.errors.submissionOpensAtLocal?.message}
          {...props.register('submissionOpensAtLocal')}
        />

        <InputField
          id="event-cfp-closes-at"
          label="Submission deadline (event time)"
          type="datetime-local"
          step={0.001}
          hint="Submissions close exactly at this time."
          error={props.errors.submissionClosesAtLocal?.message}
          {...props.register('submissionClosesAtLocal')}
        />
      </div>
      <TextareaField
        id="event-cfp-instructions"
        label="Submission instructions"
        rows={7}
        hint="Optional. Plain text, up to 10,000 characters."
        error={props.errors.submissionInstructions?.message}
        {...props.register('submissionInstructions', {
          validate: (value) =>
            Array.from(value.trim()).length <= CFP_INSTRUCTIONS_MAX_LENGTH ||
            'Use 10,000 characters or fewer.',
        })}
      />

      <InputField
        id="event-cfp-limit"
        label="Submission limit per person"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        hint="Maximum submissions one person can submit to this event. Leave blank for no limit."
        error={props.errors.maxSubmissionsPerPerson?.message}
        {...props.register('maxSubmissionsPerPerson', {
          validate: (value) => {
            try {
              parseSubmissionLimit(value);
              return true;
            } catch {
              return 'Enter a positive whole number, or leave blank for no limit.';
            }
          },
        })}
      />
    </section>
  );
};
