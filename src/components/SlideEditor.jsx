import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { toast } from 'react-hot-toast';
import { regenerateSlide, isAIConfigured } from '../utils/contentGenerator';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Code,
    Image as ImageIcon,
    Undo,
    Redo,
    Minus,
    Eye,
    Edit3,
    Code2,
    RefreshCw,
    Sparkles,
    Loader2
} from 'lucide-react';

// Theme colors - white background for AI creative freedom
const themeColors = {
    primary: '#333333',      // Dark gray for text
    secondary: '#666666',    // Medium gray
    background: '#ffffff',   // White background
    surface: '#ffffff',      // White
    text: '#333333',
    muted: '#999999'
};

// Simple HTML prettifier function
const prettifyHtml = (html) => {
    if (!html) return '';

    let formatted = '';
    let indent = 0;
    const tab = '  '; // 2 spaces

    // Split by tags
    const tokens = html.replace(/>\s*</g, '>\n<').split('\n');

    tokens.forEach(token => {
        token = token.trim();
        if (!token) return;

        // Check for closing tags or self-closing
        const isClosing = token.match(/^<\/\w/);
        const isSelfClosing = token.match(/\/\s*>$/) || token.match(/^<(img|br|hr|input|meta|link)/i);
        const isOpening = token.match(/^<\w/) && !isClosing && !isSelfClosing;

        // Decrease indent for closing tags
        if (isClosing) {
            indent = Math.max(0, indent - 1);
        }

        formatted += tab.repeat(indent) + token + '\n';

        // Increase indent for opening tags
        if (isOpening && !token.match(/^<(style|script)/i)) {
            indent++;
        }
    });

    return formatted.trim();
};

export function SlideEditor({ slide, onUpdate, presentationTitle = '' }) {
    const [viewMode, setViewMode] = useState('preview');
    const [codeContent, setCodeContent] = useState('');
    const [iframeKey, setIframeKey] = useState(0);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const iframeRef = useRef(null);

    // Detect if content has AI-generated styles
    const hasRichStyles = slide?.content?.includes('style=') || slide?.content?.includes('<style>');

    // Handle regenerate slide
    const handleRegenerate = useCallback(async () => {
        if (!isAIConfigured()) {
            toast.error('Please configure your API key in Settings first.');
            return;
        }

        setIsRegenerating(true);
        const toastId = toast.loading('Regenerating slide...');

        try {
            const result = await regenerateSlide(
                slide?.title || 'Untitled Slide',
                presentationTitle
            );

            onUpdate({
                title: result.title,
                content: result.content,
                notes: result.notes,
            });

            toast.success('Slide regenerated!', { id: toastId });
        } catch (error) {
            console.error('Regenerate error:', error);
            toast.error(error.message || 'Failed to regenerate slide', { id: toastId });
        } finally {
            setIsRegenerating(false);
        }
    }, [slide?.title, presentationTitle, onUpdate]);

    // Initialize code content when slide changes (prettified)
    useEffect(() => {
        setCodeContent(prettifyHtml(slide?.content || ''));
    }, [slide?.id]);

    // Force iframe remount when content or slide changes
    useEffect(() => {
        if (viewMode === 'preview') {
            setIframeKey(prev => prev + 1);
        }
    }, [slide?.id, slide?.content, viewMode]);

    // Update iframe when content changes in preview mode
    useEffect(() => {
        if (viewMode !== 'preview') return;

        const timer = setTimeout(() => {
            if (iframeRef.current) {
                const iframe = iframeRef.current;
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc) return;

                doc.open();
                doc.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
            min-height: 100%;
            font-family: 'Inter', sans-serif;
            background: ${themeColors.background};
            color: ${themeColors.text};
        }
        body {
            padding: 30px;
        }
        /* Default styles for basic content */
        h1, h2, h3, h4, h5, h6 { margin-bottom: 0.5em; color: ${themeColors.primary}; }
        h1 { font-size: 2.5rem; background: linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        h2 { font-size: 1.75rem; }
        h3 { font-size: 1.25rem; }
        p { margin-bottom: 0.75em; line-height: 1.6; color: ${themeColors.text}; opacity: 0.85; }
        ul, ol { padding-left: 1.5em; margin-bottom: 0.75em; color: ${themeColors.text}; }
        li { margin-bottom: 0.25em; }
        blockquote { border-left: 3px solid ${themeColors.secondary}; padding-left: 1em; margin: 1em 0; color: ${themeColors.text}; opacity: 0.8; }
        code { background: rgba(39, 76, 111, 0.1); padding: 0.2em 0.4em; border-radius: 4px; font-family: 'JetBrains Mono', monospace; color: ${themeColors.primary}; }
        pre { background: rgba(39, 76, 111, 0.08); padding: 1em; border-radius: 8px; overflow-x: auto; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        a { color: ${themeColors.secondary}; }
        
        /* Empty state */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 300px;
            color: ${themeColors.muted};
            text-align: center;
        }
        .empty-state-icon { font-size: 3rem; margin-bottom: 1rem; }
    </style>
</head>
<body>
    ${slide?.content || `
        <div class="empty-state">
            <div class="empty-state-icon">✨</div>
            <p>No content yet</p>
            <p style="font-size: 0.875rem; opacity: 0.6;">Generate with AI or switch to Edit mode</p>
        </div>
    `}
</body>
</html>
                `);
                doc.close();
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [slide?.content, viewMode, iframeKey]);

    // TipTap editor for simple text editing
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Image.configure({ inline: true, allowBase64: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Placeholder.configure({
                placeholder: 'Start typing your slide content...',
            }),
        ],
        content: slide?.content || '',
        onUpdate: ({ editor }) => {
            onUpdate({ content: editor.getHTML() });
        },
    });

    // Sync editor content when slide changes
    useEffect(() => {
        if (editor && viewMode === 'edit' && slide?.content !== editor.getHTML()) {
            editor.commands.setContent(slide?.content || '');
        }
    }, [slide?.id, viewMode]);

    // Save code content
    const handleCodeSave = useCallback(() => {
        onUpdate({ content: codeContent });
    }, [codeContent, onUpdate]);

    // Add image
    const addImage = useCallback(() => {
        const url = window.prompt('Enter image URL:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    // Handle file upload
    const handleFileUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file && editor) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    editor.chain().focus().setImage({ src: reader.result }).run();
                }
            };
            reader.readAsDataURL(file);
        }
    }, [editor]);

    // Replay animations
    const replayAnimations = useCallback(() => {
        setIframeKey(prev => prev + 1);
    }, []);

    const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
        <button
            type="button"
            className={`toolbar-btn ${isActive ? 'active' : ''}`}
            onClick={onClick}
            disabled={disabled}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="slide-editor">
            {/* Mode Switcher & Toolbar */}
            <div className="slide-editor-toolbar">
                {/* View Mode Tabs */}
                <div className="view-mode-tabs">
                    <button
                        className={`view-mode-tab ${viewMode === 'preview' ? 'active' : ''}`}
                        onClick={() => setViewMode('preview')}
                        title="Preview Mode - See styled content"
                    >
                        <Eye size={14} />
                        Preview
                    </button>
                    <button
                        className={`view-mode-tab ${viewMode === 'edit' ? 'active' : ''} ${hasRichStyles ? 'disabled' : ''}`}
                        onClick={() => !hasRichStyles && setViewMode('edit')}
                        title={hasRichStyles ? "Edit mode disabled for styled content - use HTML mode to preserve styles" : "Edit Mode - Rich text editing"}
                        disabled={hasRichStyles}
                    >
                        <Edit3 size={14} />
                        Edit
                        {hasRichStyles && <span className="mode-lock">🔒</span>}
                    </button>
                    <button
                        className={`view-mode-tab ${viewMode === 'code' ? 'active' : ''}`}
                        onClick={() => {
                            setCodeContent(prettifyHtml(slide?.content || ''));
                            setViewMode('code');
                        }}
                        title="HTML Mode - Edit raw HTML with full style control"
                    >
                        <Code2 size={14} />
                        HTML
                    </button>
                </div>

                {/* Preview toolbar */}
                {viewMode === 'preview' && (
                    <div className="toolbar-group">
                        <ToolbarButton onClick={replayAnimations} title="Replay Animations">
                            <RefreshCw size={16} />
                        </ToolbarButton>
                        <div className="toolbar-divider" />
                        <button
                            className="btn btn-sm regenerate-btn"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            title="Regenerate this slide with AI"
                        >
                            {isRegenerating ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Regenerating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    Regenerate
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Edit mode toolbar */}
                {viewMode === 'edit' && editor && (
                    <>
                        <div className="toolbar-divider" />
                        <div className="toolbar-group">
                            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                                <Undo size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                                <Redo size={16} />
                            </ToolbarButton>
                        </div>
                        <div className="toolbar-divider" />
                        <div className="toolbar-group">
                            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
                                <Heading1 size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
                                <Heading2 size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
                                <Heading3 size={16} />
                            </ToolbarButton>
                        </div>
                        <div className="toolbar-divider" />
                        <div className="toolbar-group">
                            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                                <Bold size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                                <Italic size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                                <UnderlineIcon size={16} />
                            </ToolbarButton>
                        </div>
                        <div className="toolbar-divider" />
                        <div className="toolbar-group">
                            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                                <List size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
                                <ListOrdered size={16} />
                            </ToolbarButton>
                        </div>
                        <div className="toolbar-divider" />
                        <div className="toolbar-group">
                            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
                                <AlignLeft size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
                                <AlignCenter size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
                                <AlignRight size={16} />
                            </ToolbarButton>
                        </div>
                        <div className="toolbar-divider" />
                        <div className="toolbar-group">
                            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
                                <Quote size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
                                <Code size={16} />
                            </ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                                <Minus size={16} />
                            </ToolbarButton>
                        </div>
                        <div className="toolbar-divider" />
                        <div className="toolbar-group">
                            <ToolbarButton onClick={addImage} title="Add Image URL">
                                <ImageIcon size={16} />
                            </ToolbarButton>
                            <label className="toolbar-btn" title="Upload Image">
                                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                📷
                            </label>
                        </div>
                    </>
                )}

                {/* Code mode toolbar */}
                {viewMode === 'code' && (
                    <>
                        <div className="toolbar-divider" />
                        <button className="btn btn-primary btn-sm" onClick={handleCodeSave}>
                            Save HTML
                        </button>
                    </>
                )}

                {/* Style indicator */}
                {hasRichStyles && (
                    <div className="style-indicator">
                        ✨ AI Styled
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="slide-editor-content">
                {/* Preview Mode - iframe for full style support */}
                {viewMode === 'preview' && (
                    <div className="preview-container">
                        <iframe
                            key={iframeKey}
                            ref={iframeRef}
                            className="preview-iframe"
                            title="Slide Preview"
                            sandbox="allow-same-origin"
                        />
                    </div>
                )}

                {/* Edit Mode - TipTap editor */}
                {viewMode === 'edit' && editor && (
                    <div className="edit-container">
                        {hasRichStyles && (
                            <div className="edit-warning">
                                ⚠️ Warning: This slide has custom styling. Editing here will remove styles.
                                <button
                                    className="btn btn-sm"
                                    onClick={() => {
                                        setCodeContent(prettifyHtml(slide?.content || ''));
                                        setViewMode('code');
                                    }}
                                >
                                    Use HTML Mode Instead
                                </button>
                            </div>
                        )}
                        <EditorContent editor={editor} className="tiptap-editor" />
                    </div>
                )}

                {/* Code Mode - Raw HTML editor */}
                {viewMode === 'code' && (
                    <div className="code-container">
                        <textarea
                            className="code-editor"
                            value={codeContent}
                            onChange={(e) => setCodeContent(e.target.value)}
                            placeholder="Enter HTML content..."
                            spellCheck={false}
                        />
                    </div>
                )}
            </div>

            <style>{`
        .slide-editor {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
        }

        .slide-editor-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-subtle);
          flex-wrap: wrap;
        }

        .view-mode-tabs {
          display: flex;
          background: var(--surface-glass);
          border-radius: var(--radius-md);
          padding: 3px;
          gap: 2px;
        }

        .view-mode-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .view-mode-tab:hover {
          color: var(--text-primary);
          background: var(--surface-glass-hover);
        }

        .view-mode-tab.active {
          color: #b5465a;
          background: var(--bg-secondary);
          box-shadow: var(--shadow-sm);
        }

        .view-mode-tab.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .view-mode-tab.disabled:hover {
          background: transparent;
          color: var(--text-secondary);
        }

        .mode-lock {
          font-size: 10px;
          margin-left: 4px;
        }

        .regenerate-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: var(--text-xs);
          font-weight: 500;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .regenerate-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          transform: translateY(-1px);
        }

        .regenerate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--border-default);
          margin: 0 4px;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .toolbar-btn:hover:not(:disabled) {
          background: var(--surface-glass-hover);
          color: var(--text-primary);
        }

        .toolbar-btn.active {
          background: rgba(39, 76, 111, 0.15);
          color: #274c6f;
        }

        .toolbar-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .style-indicator {
          margin-left: auto;
          padding: 4px 10px;
          font-size: var(--text-xs);
          font-weight: 500;
          color: #b5465a;
          background: rgba(181, 70, 90, 0.1);
          border-radius: var(--radius-full);
        }

        .slide-editor-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        /* Preview container */
        .preview-container {
          width: 100%;
          height: 100%;
          background: #ffffff;
        }

        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: #ffffff;
        }

        /* Edit container */
        .edit-container {
          padding: 24px;
          overflow-y: auto;
          height: 100%;
          background: #ffffff;
        }

        .edit-warning {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
          margin-bottom: 16px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: var(--radius-md);
          color: #856404;
          font-size: var(--text-sm);
        }

        .edit-warning .btn {
          flex-shrink: 0;
          background: #856404;
          color: white;
          border: none;
        }

        .edit-warning .btn:hover {
          background: #6d5303;
        }

        .edit-container .tiptap-editor {
          min-height: 300px;
          color: #274c6f;
        }

        /* Code container */
        .code-container {
          height: 100%;
          padding: 12px;
          background: #f8fafc;
        }

        .code-editor {
          width: 100%;
          height: 100%;
          padding: 16px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          line-height: 1.6;
          color: #274c6f;
          background: #ffffff;
          border: 1px solid rgba(39, 76, 111, 0.15);
          border-radius: var(--radius-md);
          resize: none;
          outline: none;
        }

        .code-editor:focus {
          border-color: #274c6f;
        }

        /* TipTap placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #c0c7cc;
          float: left;
          pointer-events: none;
          height: 0;
        }
      `}</style>
        </div>
    );
}

export default SlideEditor;
