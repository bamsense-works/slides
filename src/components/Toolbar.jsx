import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Download,
    FileText,
    FileImage,
    FileType,
    Moon,
    Sun,
    Settings,
    ChevronDown,
    Key,
    Check,
    X,
    Loader2,
    MoreHorizontal,
    Upload,
    Save
} from 'lucide-react';

import { exportToHTML } from '../utils/exportHTML';
import { exportToPDF } from '../utils/exportPDF';
import { exportToPPTX } from '../utils/exportPPTX';
import { initializeAI, getStoredApiKey, isAIConfigured } from '../utils/contentGenerator';

export function Toolbar({
    presentationTitle,
    onTitleChange,
    slides,
    onStartPresentation,
    theme,
    onToggleTheme,
    onSaveProject,
    onLoadProject
}) {
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [apiKey, setApiKey] = useState(getStoredApiKey());
    const [apiKeyStatus, setApiKeyStatus] = useState(isAIConfigured() ? 'configured' : 'not-configured');

    const exportRef = useRef(null);
    const settingsRef = useRef(null);
    const fileInputRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) {
                setIsExportOpen(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExportHTML = useCallback(async () => {
        setIsExporting(true);
        try {
            await exportToHTML(presentationTitle, slides);
        } finally {
            setIsExporting(false);
            setIsExportOpen(false);
        }
    }, [presentationTitle, slides]);

    const handleExportPDF = useCallback(async () => {
        setIsExporting(true);
        setExportProgress(0);
        try {
            await exportToPDF(presentationTitle, slides, (progress) => {
                setExportProgress(progress);
            });
        } finally {
            setIsExporting(false);
            setExportProgress(0);
            setIsExportOpen(false);
        }
    }, [presentationTitle, slides]);

    const handleExportPPTX = useCallback(async () => {
        setIsExporting(true);
        setExportProgress(0);
        try {
            await exportToPPTX(presentationTitle, slides, (progress) => {
                setExportProgress(progress);
            });
        } finally {
            setIsExporting(false);
            setExportProgress(0);
            setIsExportOpen(false);
        }
    }, [presentationTitle, slides]);

    const handleApiKeySave = useCallback(() => {
        if (apiKey.trim()) {
            const success = initializeAI(apiKey.trim());
            setApiKeyStatus(success ? 'configured' : 'error');
        }
    }, [apiKey]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            onLoadProject(file);
        }
        // Reset input so same file can be selected again
        event.target.value = '';
    };

    return (
        <header className="toolbar">
            {/* Logo & Title */}
            <div className="toolbar-left">
                <div className="toolbar-logo">
                    <div className="logo-container">
                        <span className="logo-brand">Bamsense.works</span>
                        <span className="logo-title">Dev Slides</span>
                    </div>
                </div>

                <div className="toolbar-divider-vertical" />

                <input
                    type="text"
                    className="toolbar-title-input"
                    value={presentationTitle}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Untitled Presentation"
                />
            </div>

            {/* Right Actions */}
            <div className="toolbar-right">
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".json"
                />

                {/* API Key Status */}
                {apiKeyStatus === 'configured' && (
                    <div className="api-status configured" title="AI Connected">
                        <Check size={14} />
                        <span>AI Ready</span>
                    </div>
                )}

                {/* Load Project */}
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Load Project (JSON)"
                >
                    <Upload size={18} />
                </button>

                {/* Theme Toggle */}
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={onToggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Settings */}
                <div className="dropdown react-controlled" ref={settingsRef}>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>

                    <AnimatePresence>
                        {isSettingsOpen && (
                            <motion.div
                                className="dropdown-menu settings-menu"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                            >
                                <div className="settings-section">
                                    <label className="settings-label">
                                        <Key size={14} />
                                        Google AI Studio API Key
                                    </label>
                                    <div className="settings-input-row">
                                        <input
                                            type="password"
                                            className="input"
                                            placeholder="Enter your API key"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                        />
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={handleApiKeySave}
                                        >
                                            Save
                                        </button>
                                    </div>
                                    <p className="settings-hint">
                                        Get your API key from{' '}
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Google AI Studio
                                        </a>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Export Dropdown */}
                <div className="dropdown react-controlled" ref={exportRef}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsExportOpen(!isExportOpen)}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {Math.round(exportProgress * 100)}%
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                Export
                                <ChevronDown size={14} />
                            </>
                        )}
                    </button>

                    <AnimatePresence>
                        {isExportOpen && !isExporting && (
                            <motion.div
                                className="dropdown-menu"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                            >
                                <button className="dropdown-item" onClick={onSaveProject}>
                                    <Save size={16} />
                                    <div className="dropdown-item-content">
                                        <span className="dropdown-item-title">Save Project</span>
                                        <span className="dropdown-item-desc">Backup as JSON</span>
                                    </div>
                                </button>
                                <div className="dropdown-divider" style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                                <button className="dropdown-item" onClick={handleExportHTML}>
                                    <FileText size={16} />
                                    <div className="dropdown-item-content">
                                        <span className="dropdown-item-title">HTML</span>
                                        <span className="dropdown-item-desc">Standalone web page</span>
                                    </div>
                                </button>
                                <button className="dropdown-item" onClick={handleExportPDF}>
                                    <FileImage size={16} />
                                    <div className="dropdown-item-content">
                                        <span className="dropdown-item-title">PDF</span>
                                        <span className="dropdown-item-desc">Printable document</span>
                                    </div>
                                </button>
                                <button className="dropdown-item" onClick={handleExportPPTX}>
                                    <FileType size={16} />
                                    <div className="dropdown-item-content">
                                        <span className="dropdown-item-title">PowerPoint</span>
                                        <span className="dropdown-item-desc">Editable PPTX file</span>
                                    </div>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Present Button */}
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => onStartPresentation(0)}
                >
                    <Play size={18} />
                    Present
                </button>
            </div>

            <style>{`
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          gap: 20px;
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .toolbar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-container {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .logo-brand {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }

        .logo-title {
          font-size: 18px;
          font-weight: 700;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .toolbar-divider-vertical {
          width: 1px;
          height: 28px;
          background: var(--border-default);
        }

        .toolbar-title-input {
          flex: 1;
          max-width: 400px;
          padding: 8px 12px;
          font-size: var(--text-base);
          font-weight: 500;
          color: var(--text-primary);
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          outline: none;
          transition: all var(--transition-fast);
        }

        .toolbar-title-input:hover {
          background: var(--surface-glass);
        }

        .toolbar-title-input:focus {
          background: var(--surface-glass);
          border-color: var(--accent-primary);
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .api-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: var(--text-xs);
          font-weight: 500;
          border-radius: var(--radius-full);
        }

        .api-status.configured {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .dropdown {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          padding: 8px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          z-index: var(--z-dropdown);
        }

        .dropdown-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          color: var(--text-primary);
        }

        .dropdown-item:hover {
          background: var(--surface-glass-hover);
        }

        .dropdown-item svg {
          margin-top: 2px;
          color: var(--text-tertiary);
        }

        .dropdown-item-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dropdown-item-title {
          font-size: var(--text-sm);
          font-weight: 500;
        }

        .dropdown-item-desc {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .settings-menu {
          min-width: 320px;
          padding: 16px;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .settings-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
        }

        .settings-input-row {
          display: flex;
          gap: 8px;
        }

        .settings-input-row .input {
          flex: 1;
        }

        .settings-hint {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }

        .settings-hint a {
          color: var(--accent-primary);
        }
      `}</style>
        </header>
    );
}

export default Toolbar;
