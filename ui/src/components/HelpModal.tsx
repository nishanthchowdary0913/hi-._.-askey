import React from 'react';
import { X, Phone, Mail, MapPin, ExternalLink, LifeBuoy, AlertTriangle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
}) => {
  if (!isOpen) return null;

  const contacts = [
    {
      dept: 'EIT IT Help Desk',
      location: 'Atrium 102 (1st floor)',
      phone: '902-496-8111',
      email: 'helpdesk@smu.ca',
      desc: 'Assists with SMU accounts, Eduroam Wi-Fi, Duo MFA, password resets, Brightspace access.',
    },
    {
      dept: 'The Service Centre',
      location: 'McNally Main 108 (MM108)',
      phone: '902-420-5582',
      email: 'service.centre@smu.ca',
      desc: 'Student ID cards (Huskies Card), official transcripts, tuition payments, U-Pass transit passes.',
    },
    {
      dept: 'Patrick Power Library Desk',
      location: 'Library Main Floor',
      phone: '902-420-5544',
      email: 'library@smu.ca',
      desc: 'Research consultations, course reserves, Novanet borrowing, and study room bookings.',
    },
    {
      dept: 'Student Success Centre',
      location: 'Student Centre 3rd Floor',
      phone: '902-491-6241',
      email: 'success@smu.ca',
      desc: 'Undergraduate academic advising, tutoring services, writing support, and time management coaching.',
    },
    {
      dept: 'Campus Security & Emergency',
      location: 'McNally South (24/7)',
      phone: '902-420-5577',
      email: 'security@smu.ca',
      desc: '24/7 campus dispatch, Safe Walk program, lost and found, and emergency response.',
      isEmergency: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 relative ${
          isDarkMode
            ? 'bg-[#091a32] border-[#1E3A5F] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-amber-500/20 border border-blue-500/40 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Saint Mary's University Contacts & Help</h3>
            <p className="text-xs text-slate-400">
              Direct departmental contacts across the Halifax campus
            </p>
          </div>
        </div>

        {/* Contact List */}
        <div className="space-y-3">
          {contacts.map((c, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border transition-colors ${
                c.isEmergency
                  ? isDarkMode
                    ? 'bg-rose-950/30 border-rose-600/40'
                    : 'bg-rose-50 border-rose-200'
                  : isDarkMode
                  ? 'bg-[#061325] border-[#1E3A5F]'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2">
                  {c.isEmergency && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  <h4 className="font-bold text-sm text-amber-300">{c.dept}</h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{c.location}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-2">{c.desc}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-slate-700/30">
                <a
                  href={`tel:${c.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors font-mono"
                >
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>{c.phone}</span>
                </a>
                <a
                  href={`mailto:${c.email}`}
                  className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <Mail className="w-3 h-3 text-amber-400" />
                  <span>{c.email}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
