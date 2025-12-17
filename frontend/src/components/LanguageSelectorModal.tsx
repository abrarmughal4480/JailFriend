import React, { useState } from 'react';
import Modal from './Modal';
import { FiGlobe, FiCheck } from 'react-icons/fi';

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

interface LanguageSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (languageCode: string) => void;
}

const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const handleConfirm = () => {
        onSelect(selectedLanguage);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                    <FiGlobe size={32} />
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Real-Time Translation
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
                    What is your language? You will hear the other person translated into this language.
                </p>

                <div className="grid grid-cols-2 gap-2 w-full mb-6 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setSelectedLanguage(lang.code)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${selectedLanguage === lang.code
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <span className="font-medium">{lang.name}</span>
                            {selectedLanguage === lang.code && <FiCheck size={18} />}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                >
                    Start Listening
                </button>

                <button
                    onClick={onClose}
                    className="mt-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors"
                >
                    Skip for now
                </button>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
        </Modal>
    );
};

export default LanguageSelectorModal;
