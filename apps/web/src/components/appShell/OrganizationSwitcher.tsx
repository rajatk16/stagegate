import { Building2, ChevronDown } from 'lucide-react';

export const OrganizationSwitcher = () => {
  return (
    <button
      className="
    flex
    w-full
    items-center
    justify-between
    rounded-lg
    border
    px-3
    py-2
  "
    >
      <div className="flex items-center gap-2">
        <Building2 size={18} />
        <div className="text-left">
          <div className="text-sm font-medium">StageGate Inc.</div>
        </div>
      </div>
      <ChevronDown size={16} />
    </button>
  );
};
