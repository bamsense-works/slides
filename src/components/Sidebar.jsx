import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Plus,
    Trash2,
    Copy,
    GripVertical,
    Sparkles,
    Loader2,
    X,
    ChevronDown,
    Wand2,
    Code,
    Check
} from 'lucide-react';
import { createPresentationPrompt } from '../utils/contentGenerator';

export function Sidebar({
    slides,
    currentSlideIndex,
    onSlideSelect,
    onAddSlide,
    onDeleteSlide,
    onDuplicateSlide,
    onReorderSlides,
    onGeneratePresentation,
    onImportPresentation,
    isGenerating,
}) {
    const [showTopicInput, setShowTopicInput] = useState(false);
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [slideCount, setSlideCount] = useState(8);
    
    // Manual Mode State
    const [isManualMode, setIsManualMode] = useState(false);
    const [manualResponse, setManualResponse] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) return;
        
        if (isManualMode) {
             if (!manualResponse.trim()) return;
             await onImportPresentation(manualResponse, topic);
        } else {
             // Pass description and instructions as combined context
             const context = [description, instructions].filter(s => s.trim());
             await onGeneratePresentation(topic, context, slideCount);
        }
        
        // Reset state
        setShowTopicInput(false);
        setTopic('');
        setDescription('');
        setInstructions('');
        setManualResponse('');
        setSlideCount(8);
        setIsManualMode(false);
    }, [topic, description, instructions, manualResponse, slideCount, isManualMode, onGeneratePresentation, onImportPresentation]);

    const handleReorder = useCallback((newOrder) => {
        // Find the indices and reorder
        const currentIds = slides.map(s => s.id);
        const newIds = newOrder.map(s => s.id);

        if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
            newOrder.forEach((slide, newIndex) => {
                const oldIndex = slides.findIndex(s => s.id === slide.id);
                if (oldIndex !== newIndex) {
                    onReorderSlides(oldIndex, newIndex);
                }
            });
        }
    }, [slides, onReorderSlides]);

    const getGeneratedPrompt = () => {
        const context = [description, instructions].filter(s => s.trim());
        const { systemPrompt, userPrompt } = createPresentationPrompt(topic, context, slideCount);
        return `${systemPrompt}\n\n${userPrompt}`;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getGeneratedPrompt());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <aside className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <h2 className="sidebar-title">Slides</h2>
                <span className="sidebar-count">{slides.length}</span>
            </div>

            {/* AI Generate Button */}
            <div className="sidebar-actions">
                <button
                    className="btn btn-primary w-full"
                    onClick={() => setShowTopicInput(true)}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            Generate with AI
                        </>
                    )}
                </button>
            </div>

            {/* Topic Input Modal */}
            <AnimatePresence>
                {showTopicInput && (
                    <motion.div
                        className="topic-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTopicInput(false)}
                    >
                        <motion.div
                            className="topic-modal"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="topic-modal-header">
                                <h3>{isManualMode ? 'Manual Import' : 'Generate Presentation'}</h3>
                                <div className="header-actions">
                                    <button 
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setIsManualMode(!isManualMode)}
                                    >
                                        {isManualMode ? 'Switch to Auto' : 'No API Key?'}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => setShowTopicInput(false)}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="topic-modal-content">
                                <div className="form-group">
                                    <label className="form-label">Topic</label>
                                    <input
                                        type="text"
                                        className="input input-lg"
                                        placeholder="e.g., Introduction to Machine Learning"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {!isManualMode && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Description
                                                <span className="form-label-hint">(optional)</span>
                                            </label>
                                            <textarea
                                                className="input textarea"
                                                placeholder="Describe what you want to cover in the presentation..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Number of Slides
                                                <span className="form-label-hint">(1-50)</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="input"
                                                min="1"
                                                max="50"
                                                value={slideCount}
                                                onChange={(e) => setSlideCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 8)))}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Special Instructions
                                                <span className="form-label-hint">(optional)</span>
                                            </label>
                                            <textarea
                                                className="input textarea"
                                                placeholder="Any specific style, colors, or requirements..."
                                                value={instructions}
                                                onChange={(e) => setInstructions(e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                    </>
                                )}

                                {isManualMode && topic && (
                                    <div className="manual-mode-section">
                                        <div className="form-group">
                                            <label className="form-label">
                                                1. Copy Prompt ({slideCount} slides)
                                                <button 
                                                    className="btn btn-xs btn-ghost ml-2"
                                                    onClick={copyToClipboard}
                                                >
                                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                                    {copied ? ' Copied!' : ' Copy'}
                                                </button>
                                            </label>
                                            <div className="form-group">
                                                <input
                                                    type="number"
                                                    className="input input-sm mb-2"
                                                    style={{ maxWidth: '100px' }}
                                                    min="1"
                                                    max="50"
                                                    value={slideCount}
                                                    onChange={(e) => setSlideCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 8)))}
                                                />
                                            </div>
                                            <div className="prompt-preview">
                                                {getGeneratedPrompt()}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">2. Paste AI Response (JSON)</label>
                                            <textarea
                                                className="input textarea code-input"
                                                placeholder='Paste the JSON response here (e.g., { "title": "...", "slides": [...] })'
                                                value={manualResponse}
                                                onChange={(e) => setManualResponse(e.target.value)}
                                                rows={6}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="topic-modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowTopicInput(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleGenerate}
                                    disabled={!topic.trim() || isGenerating || (isManualMode && !manualResponse.trim())}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {isManualMode ? <Code size={16} /> : <Wand2 size={16} />}
                                            {isManualMode ? 'Import Slides' : 'Generate'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Slides List */}
            <div className="sidebar-slides">
                <Reorder.Group
                    axis="y"
                    values={slides}
                    onReorder={handleReorder}
                    className="slides-list"
                >
                    {slides.map((slide, index) => (
                        <Reorder.Item
                            key={slide.id}
                            value={slide}
                            className={`slide-item ${index === currentSlideIndex ? 'active' : ''}`}
                        >
                            <div
                                className="slide-item-content"
                                onClick={() => onSlideSelect(index)}
                            >
                                <div className="slide-item-drag">
                                    <GripVertical size={14} />
                                </div>
                                <div className="slide-item-preview">
                                    <div
                                        className="slide-item-preview-content"
                                        dangerouslySetInnerHTML={{
                                            __html: slide.content?.substring(0, 200) || '<p>Empty slide</p>'
                                        }}
                                    />
                                </div>
                                <div className="slide-item-info">
                                    <span className="slide-item-number">{index + 1}</span>
                                    <span className="slide-item-title">{slide.title || `Slide ${index + 1}`}</span>
                                </div>
                            </div>

                            <div className="slide-item-actions">
                                <button
                                    className="btn btn-ghost btn-icon btn-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDuplicateSlide(index);
                                    }}
                                    title="Duplicate"
                                >
                                    <Copy size={12} />
                                </button>
                                <button
                                    className="btn btn-ghost btn-icon btn-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSlide(index);
                                    }}
                                    disabled={slides.length <= 1}
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            {/* Add Slide Button */}
            <div className="sidebar-footer">
                <button
                    className="btn btn-secondary w-full"
                    onClick={() => onAddSlide()}
                >
                    <Plus size={16} />
                    Add Slide
                </button>
            </div>

            <style>{`
        .sidebar {
          width: 280px;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .sidebar-title {
          font-size: var(--text-lg);
          font-weight: 600;
        }

        .sidebar-count {
          padding: 2px 10px;
          font-size: var(--text-xs);
          font-weight: 500;
          background: var(--surface-glass);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
        }

        .sidebar-actions {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .sidebar-slides {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .slides-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          list-style: none;
        }

        .slide-item {
          display: flex;
          align-items: stretch;
          background: var(--surface-glass);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          overflow: hidden;
        }

        .slide-item:hover {
          border-color: var(--border-default);
          background: var(--surface-glass-hover);
        }

        .slide-item.active {
          border-color: var(--accent-primary);
          background: var(--accent-glow);
        }

        .slide-item-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          min-width: 0;
        }

        .slide-item-drag {
          color: var(--text-muted);
          cursor: grab;
        }

        .slide-item-drag:active {
          cursor: grabbing;
        }

        .slide-item-preview {
          width: 60px;
          height: 40px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          overflow: hidden;
          flex-shrink: 0;
        }

        .slide-item-preview-content {
          transform: scale(0.1);
          transform-origin: top left;
          width: 600px;
          height: 400px;
          pointer-events: none;
          font-size: 10px;
        }

        .slide-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .slide-item-number {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--accent-primary);
        }

        .slide-item-title {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .slide-item-actions {
          display: flex;
          flex-direction: column;
          padding: 4px;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .slide-item:hover .slide-item-actions {
          opacity: 1;
        }

        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border-subtle);
        }

        .w-full {
          width: 100%;
        }

        /* Topic Modal */
        .topic-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal);
          padding: 20px;
        }

        .topic-modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }

        .topic-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .topic-modal-header h3 {
          font-size: var(--text-lg);
          font-weight: 600;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topic-modal-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
        }

        .form-label-hint {
          font-weight: 400;
          color: var(--text-muted);
          margin-left: 4px;
        }

        .textarea {
          resize: vertical;
          min-height: 60px;
          font-family: inherit;
          line-height: 1.5;
        }
        
        .manual-mode-section {
            border-top: 1px solid var(--border-subtle);
            padding-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .prompt-preview {
            background: var(--bg-tertiary);
            padding: 12px;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-subtle);
            font-family: monospace;
            font-size: var(--text-xs);
            white-space: pre-wrap;
            max-height: 150px;
            overflow-y: auto;
            color: var(--text-secondary);
        }
        
        .code-input {
            font-family: monospace;
            font-size: var(--text-xs);
        }

        .topic-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border-subtle);
        }
        
        .ml-2 { margin-left: 8px; }
      `}</style>
        </aside>
    );
}

export default Sidebar;
