import { useState } from 'react';
import useOrgStore from '../../store/orgStore';

const OrgSwitcher = ({ onCreateNew }) => {
  const { orgs, currentOrg, setCurrentOrg } = useOrgStore();
  const [open, setOpen] = useState(false);

  const handleSelect = (org) => {
    setCurrentOrg(org);
    setOpen(false);
  };

  // Get initials from org name for avatar
  const getInitials = (name) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative">
      {/* Trigger button — shows current org */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition w-full text-left"
      >
        {currentOrg ? (
          <>
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(currentOrg.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 hover:text-white truncate">{currentOrg.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentOrg.role}</p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        ) : (
          <span className="text-sm text-gray-500">No organisation</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelect(org)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition text-left ${
                  currentOrg?.id === org.id
                    ? 'bg-indigo-600/20 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(org.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{org.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{org.role}</p>
                </div>
                {currentOrg?.id === org.id && (
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Divider + Create new */}
          <div className="border-t border-gray-800 p-1">
            <button
              onClick={() => { setOpen(false); onCreateNew(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition text-left text-sm"
            >
              <div className="w-6 h-6 rounded-md border border-dashed border-gray-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              Create new organisation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgSwitcher;