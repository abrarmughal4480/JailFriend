import React, { useState } from 'react';
import { FiGlobe, FiMic, FiMicOff } from 'react-icons/fi';

interface TranslationControlsProps {
  enabled: boolean;
  isTranslating: boolean;
  config?: TranslationConfig;
  currentTranscript?: string;
  currentTranslation?: string;
  onToggle: (enabled: boolean, config: TranslationConfig) => void;
}

export interface TranslationConfig {
  targetLanguage: string;
  sourceLanguage?: string;
  translationType: 'one_way' | 'two_way';
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' }
];

export const TranslationControls: React.FC<TranslationControlsProps> = ({
  enabled,
  isTranslating,
  config,
  currentTranscript,
  currentTranslation,
  onToggle
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(config?.targetLanguage || 'hi');
  const [sourceLanguage, setSourceLanguage] = useState(config?.sourceLanguage || 'en');
  const [translationType] = useState<'one_way' | 'two_way'>('one_way');

  // Sync with prop changes
  React.useEffect(() => {
    if (config) {
      if (config.targetLanguage) setTargetLanguage(config.targetLanguage);
      if (config.sourceLanguage) setSourceLanguage(config.sourceLanguage);
    }
  }, [config]);

  const handleToggle = () => {
    if (enabled) {
      onToggle(false, { targetLanguage, sourceLanguage, translationType });
      setShowSettings(false);
    } else {
      // Validate that source and target languages are different
      if (sourceLanguage === targetLanguage) {
        alert('Please select different languages. You cannot translate a language to itself.');
        return;
      }
      onToggle(true, { targetLanguage, sourceLanguage, translationType });
      setShowSettings(false);
    }
  };

  return (
    <div className="translation-controls">
      {/* Translation Toggle Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`translation-btn ${enabled ? 'active' : ''}`}
        title="Translation Settings"
      >
        <FiGlobe size={20} />
        {enabled && <span className="active-indicator"></span>}
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="translation-settings-panel">
          <div className="settings-header">
            <h3>Real-Time Translation</h3>
            <button onClick={() => setShowSettings(false)} className="close-btn">×</button>
          </div>

          <div className="settings-body">
            {/* Translation Type - Hidden, always one-way */}

            {/* Source Language - What the OTHER person speaks */}
            <div className="setting-group">
              <label>They Speak</label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="setting-select"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Language - What YOU want to hear */}
            <div className="setting-group">
              <label>I Hear</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="setting-select"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Info Message */}
            <div className="translation-info">
              <p>💡 Translates the other person's speech into your language</p>
            </div>

            {/* Enable/Disable Button */}
            <button
              onClick={handleToggle}
              className={`toggle-translation-btn ${enabled ? 'enabled' : ''}`}
            >
              {enabled ? (
                <>
                  <FiMicOff size={18} />
                  <span>Disable Translation</span>
                </>
              ) : (
                <>
                  <FiMic size={18} />
                  <span>Enable Translation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Persistent Live Transcript - Visible when translation is enabled even if settings are closed */}
      {enabled && (
        <div className="persistent-translation-overlay">
          {/* Status Indicator */}
          <div className="translation-status-mini">
            <span className={`status-dot ${isTranslating ? 'active' : ''}`}></span>
            <span>{isTranslating ? 'Listening...' : 'Ready'}</span>
          </div>

          {/* Transcript/Translation */}
          {(currentTranscript || currentTranslation) && (
            <div className="live-transcript-mini">
              {currentTranscript && (
                <div className="transcript-item">
                  <span className="label">Original:</span>
                  <p>{currentTranscript}</p>
                </div>
              )}
              {currentTranslation && (
                <div className="transcript-item translation">
                  <span className="label">Translation:</span>
                  <p>{currentTranslation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .translation-controls {
          position: relative;
        }

        .translation-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          color: white;
        }

        .translation-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .translation-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
        }

        .active-indicator {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .translation-settings-panel {
          position: absolute;
          bottom: 60px;
          right: 0;
          width: 320px;
          background: rgba(30, 30, 30, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 1000;
          overflow: hidden;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .settings-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .settings-body {
          padding: 20px;
        }

        .setting-group {
          margin-bottom: 16px;
        }

        .setting-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .setting-select {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .setting-select:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .setting-select:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.1);
        }

        .setting-select option {
          background: #1a1a1a;
          color: white;
        }

        .translation-info {
          margin: 16px 0;
          padding: 12px;
          background: rgba(102, 126, 234, 0.1);
          border-left: 3px solid #667eea;
          border-radius: 6px;
        }

        .translation-info p {
          margin: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }

        .toggle-translation-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          margin-top: 20px;
        }

        .toggle-translation-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .toggle-translation-btn.enabled {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .toggle-translation-btn.enabled:hover {
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .translation-status {
          margin-top: 16px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
        }

        .status-dot.active {
          background: #10b981;
          animation: pulse 2s infinite;
        }

        .live-transcript {
          margin-top: 16px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .transcript-item {
          margin-bottom: 12px;
        }

        .transcript-item:last-child {
          margin-bottom: 0;
        }

        .transcript-item label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 4px;
        }

        .transcript-item p {
          margin: 0;
          font-size: 13px;
          color: white;
          line-height: 1.5;
        }

        .transcript-item.translation label {
          color: #667eea;
        }

        .transcript-item.translation p {
          color: #a5b4fc;
        }

        .persistent-translation-overlay {
          position: absolute;
          bottom: 60px;
          right: 60px;
          width: 300px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .translation-status-mini {
          align-self: flex-end;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          padding: 6px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .live-transcript-mini {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(15px);
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .live-transcript-mini .transcript-item {
          margin-bottom: 8px;
        }

        .live-transcript-mini .transcript-item:last-child {
          margin-bottom: 0;
        }

        .live-transcript-mini .label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          margin-right: 6px;
        }

        .live-transcript-mini p {
          display: inline;
          font-size: 13px;
          color: white;
          margin: 0;
        }

        .live-transcript-mini .transcript-item.translation p {
          color: #a5b4fc;
        }
      `}</style>
    </div>
  );
};
