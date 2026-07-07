import ackoDriveLogo from "../assets/icons/acko-drive-logo.png";

export function IncomingCallScreen({
  callerName,
  onPick,
  onReject,
}: {
  callerName: string;
  onPick: () => void;
  onReject: () => void;
}) {
  return (
    <div className="ad-incoming-call-page">
      <header className="ad-incoming-call-header">
        <div className="ad-incoming-call-header-left">
          <div className="ad-incoming-call-badge" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.58 1 1 0 01-.24 1L6.6 10.8z"
                fill="currentColor"
              />
            </svg>
          </div>
          <button
            type="button"
            className="ad-incoming-call-back"
            onClick={onReject}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14.5 5.5L8 12l6.5 6.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <img
          src={ackoDriveLogo}
          alt="ACKO Drive"
          className="ad-incoming-call-logo"
          width={286}
          height={96}
          decoding="async"
        />
      </header>

      <div className="ad-incoming-call-body">
        <p className="ad-incoming-call-name">{callerName}</p>
        <p className="ad-incoming-call-status">ringing...</p>
      </div>

      <footer className="ad-incoming-call-controls">
        <div className="ad-incoming-call-util-row">
          <div className="ad-incoming-call-util">
            <button type="button" className="ad-incoming-call-util-btn" aria-label="Mute" disabled>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="ad-incoming-call-util-label">Mute</span>
          </div>
          <div className="ad-incoming-call-util">
            <button type="button" className="ad-incoming-call-util-btn" aria-label="Speaker" disabled>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M11 5L6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 010 7M18 5a9 9 0 010 14"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="ad-incoming-call-util-label">Speaker</span>
          </div>
        </div>

        <div className="ad-incoming-call-actions">
          <div className="ad-incoming-call-action">
            <button type="button" className="ad-incoming-call-reject-btn" onClick={onReject} aria-label="Reject call">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.58 1 1 0 01-.24 1L6.6 10.8z"
                  fill="currentColor"
                  transform="rotate(135 12 12)"
                />
              </svg>
            </button>
            <span className="ad-incoming-call-primary-label">Reject</span>
          </div>

          <div className="ad-incoming-call-action">
            <button type="button" className="ad-incoming-call-pick-btn" onClick={onPick} aria-label="Pick call">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.58 1 1 0 01-.24 1L6.6 10.8z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <span className="ad-incoming-call-primary-label">Pick Call</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
