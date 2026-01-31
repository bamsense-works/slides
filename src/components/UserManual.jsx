import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Zap, Terminal, Download, Play, FileJson } from 'lucide-react';

export function UserManual({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="manual-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="manual-modal"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="manual-header">
                            <h2>User Guide</h2>
                            <button className="btn btn-ghost btn-icon" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="manual-content">
                            {/* Privacy Statement */}
                            <div className="privacy-banner">
                                <div className="privacy-icon">
                                    <Shield size={24} />
                                </div>
                                <div className="privacy-text">
                                    <h3>100% Private & Local</h3>
                                    <p>
                                        This app runs entirely in your browser. No data is collected, stored, or sent to our servers. 
                                        Your API key (if used) connects directly to Google. Your presentations are stored locally on your device.
                                    </p>
                                </div>
                            </div>

                            <div className="manual-grid">
                                {/* Getting Started */}
                                <section className="manual-section">
                                    <h3><Zap size={18} /> Getting Started</h3>
                                    <p>You have two ways to generate slides:</p>
                                    <ul>
                                        <li>
                                            <strong>Automatic Mode:</strong> Configure your Google AI API Key in <span className="highlight">Settings</span> for one-click generation.
                                        </li>
                                        <li>
                                            <strong>Manual Mode:</strong> No API Key? No problem. Click <span className="highlight">No API Key?</span> in the generation menu to copy our optimized prompt, paste it into ChatGPT/Gemini, and import the result.
                                        </li>
                                    </ul>
                                </section>

                                {/* Editing */}
                                <section className="manual-section">
                                    <h3><FileJson size={18} /> Project Management</h3>
                                    <ul>
                                        <li>
                                            <strong>Save Project:</strong> Download your work as a <code>.json</code> file to backup or move to another device.
                                        </li>
                                        <li>
                                            <strong>Load Project:</strong> Restore a previously saved <code>.json</code> file to continue working.
                                        </li>
                                    </ul>
                                </section>

                                {/* Features */}
                                <section className="manual-section">
                                    <h3><Play size={18} /> Presentation & Export</h3>
                                    <ul>
                                        <li>
                                            <strong>Present:</strong> Click the Play button to enter full-screen presentation mode. The branding is hidden automatically.
                                        </li>
                                        <li>
                                            <strong>Export:</strong> Download your slides as <strong>HTML</strong> (interactive), <strong>PDF</strong> (printable), or <strong>PowerPoint</strong> (editable).
                                        </li>
                                    </ul>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            <style>{`
                .manual-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .manual-modal {
                    width: 100%;
                    max-width: 800px;
                    max-height: 85vh;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-default);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-2xl);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .manual-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .manual-header h2 {
                    font-size: var(--text-xl);
                    font-weight: 600;
                }

                .manual-content {
                    padding: 24px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .privacy-banner {
                    display: flex;
                    gap: 16px;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    padding: 20px;
                    border-radius: var(--radius-lg);
                }

                .privacy-icon {
                    color: var(--success);
                    margin-top: 4px;
                }

                .privacy-text h3 {
                    font-size: var(--text-lg);
                    font-weight: 600;
                    color: var(--success);
                    margin-bottom: 4px;
                }

                .privacy-text p {
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .manual-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                }

                .manual-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .manual-section h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: var(--text-md);
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .manual-section ul {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 0;
                }

                .manual-section li {
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                    line-height: 1.6;
                    padding-left: 12px;
                    border-left: 2px solid var(--border-default);
                }

                .manual-section strong {
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .highlight {
                    background: var(--bg-tertiary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                    border: 1px solid var(--border-subtle);
                }

                code {
                    background: var(--bg-tertiary);
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 12px;
                }
            `}</style>
        </AnimatePresence>
    );
}
