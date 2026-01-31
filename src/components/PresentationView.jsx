import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Maximize, Minimize } from 'lucide-react';

export function PresentationView({
    slides,
    currentIndex,
    onClose,
    onNext,
    onPrevious,
    onGoTo
}) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const iframeRef = useRef(null);
    const containerRef = useRef(null);

    // Theme colors - white background for AI creative freedom
    const themeColors = {
        primary: '#333333',
        secondary: '#666666',
        background: '#ffffff',
        surface: '#ffffff',
        text: '#333333'
    };

    // Focus container on mount and after any click
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, []);

    // Refocus container when clicking anywhere in presentation
    const handleContainerClick = useCallback((e) => {
        // Don't interfere with button clicks
        if (e.target.tagName === 'BUTTON') return;

        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, []);

    // Update iframe content when slide changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (iframeRef.current) {
                const iframe = iframeRef.current;
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc) return;

                const currentSlide = slides[currentIndex];

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
                                height: 100%;
                                font-family: 'Inter', sans-serif;
                                background: ${themeColors.background};
                                overflow: hidden;
                            }
                            body {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 60px;
                            }
                            /* Default content styles */
                            h1 { font-size: 4rem; margin-bottom: 1.5rem; color: ${themeColors.primary}; }
                            h2 { font-size: 2.5rem; margin-bottom: 1rem; color: ${themeColors.primary}; }
                            h3 { font-size: 2rem; margin-bottom: 0.75rem; color: ${themeColors.primary}; }
                            p { font-size: 1.5rem; line-height: 1.8; margin-bottom: 1rem; color: ${themeColors.text}; opacity: 0.85; }
                            ul, ol { font-size: 1.5rem; line-height: 2; padding-left: 2em; color: ${themeColors.text}; }
                            li { margin-bottom: 0.5rem; }
                            blockquote { border-left: 4px solid ${themeColors.secondary}; padding-left: 1.5em; margin: 1.5em 0; font-style: italic; color: ${themeColors.text}; opacity: 0.8; }
                            code { background: rgba(0, 0, 0, 0.1); padding: 0.2em 0.5em; border-radius: 4px; font-family: monospace; color: ${themeColors.primary}; }
                            pre { background: rgba(0, 0, 0, 0.08); padding: 1.5em; border-radius: 12px; overflow-x: auto; }
                            img { max-width: 100%; height: auto; border-radius: 12px; }
                            a { color: ${themeColors.secondary}; }
                            
                            /* Container for content */
                            .slide-wrapper {
                                width: 100%;
                                max-width: 1400px;
                                min-height: 100%;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                color: ${themeColors.text};
                            }
                        </style>
                    </head>
                    <body>
                        <div class="slide-wrapper">
                            ${currentSlide?.content || '<h1>No content</h1>'}
                        </div>
                    </body>
                    </html>
                `);
                doc.close();
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [slides, currentIndex, iframeKey]);

    // Force iframe remount on slide change
    useEffect(() => {
        setIframeKey(prev => prev + 1);
    }, [currentIndex]);

    // Handle keyboard navigation on container
    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
            case 'Enter':
                e.preventDefault();
                onNext();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                onPrevious();
                break;
            case 'Escape':
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    onClose();
                }
                break;
            case 'Home':
                e.preventDefault();
                onGoTo(0);
                break;
            case 'End':
                e.preventDefault();
                onGoTo(slides.length - 1);
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
            default:
                if (e.key >= '1' && e.key <= '9') {
                    const index = parseInt(e.key) - 1;
                    if (index < slides.length) {
                        onGoTo(index);
                    }
                }
        }
    }, [onNext, onPrevious, onClose, onGoTo, slides.length]);

    // Fullscreen change handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    }, []);

    // Enter fullscreen on mount
    useEffect(() => {
        toggleFullscreen();
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, []);

    const progress = ((currentIndex + 1) / slides.length) * 100;

    return (
        <div
            ref={containerRef}
            className="presentation-overlay"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={handleContainerClick}
        >
            {/* Brand Logo - Only on first slide - Commented out for now
            {currentIndex === 0 && (
                <div className="presentation-logo">
                    <div className="presentation-brand-container">
                        <span className="presentation-brand">bamsense.works</span>
                        <span className="presentation-app-name">Dev Slides</span>
                    </div>
                </div>
            )} */}

            {/* Progress bar */}
            <div className="presentation-progress">
                <motion.div
                    className="presentation-progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Slide content */}
            <div className="presentation-slide" onClick={() => containerRef.current?.focus()}>
                <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    className="presentation-iframe"
                    title="Slide Content"
                    sandbox="allow-same-origin"
                />
            </div>

            {/* Slide counter */}
            <div className="presentation-counter">
                <span className="presentation-counter-current">{currentIndex + 1}</span>
                <span className="presentation-counter-separator">/</span>
                <span className="presentation-counter-total">{slides.length}</span>
            </div>

            {/* Top controls */}
            <div className="presentation-top-controls">
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={toggleFullscreen}
                    title="Toggle fullscreen (F)"
                >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>

                <button
                    className="btn btn-ghost btn-icon"
                    onClick={onClose}
                    title="Exit presentation (Esc)"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Click zones for navigation (invisible) */}
            <div
                className="presentation-click-zone presentation-click-left"
                onClick={(e) => { e.stopPropagation(); onPrevious(); containerRef.current?.focus(); }}
            />
            <div
                className="presentation-click-zone presentation-click-right"
                onClick={(e) => { e.stopPropagation(); onNext(); containerRef.current?.focus(); }}
            />

            <style>{`
        .presentation-overlay {
          position: fixed;
          inset: 0;
          z-index: var(--z-fullscreen);
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }

        .presentation-overlay:focus {
          outline: none;
        }

        .presentation-logo {
          position: absolute;
          top: 24px;
          left: 32px;
          z-index: 10;
        }

        .presentation-brand-container {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .presentation-brand {
          font-size: 14px;
          font-weight: 500;
          color: #666;
          letter-spacing: 0.5px;
        }

        .presentation-app-name {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .presentation-progress {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(0, 0, 0, 0.1);
        }

        .presentation-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
        }

        .presentation-slide {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          cursor: default;
        }

        .presentation-iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 8px;
          background: #ffffff;
          pointer-events: none;
        }

        .presentation-counter {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .presentation-counter-current {
          color: #3b82f6;
          font-weight: 600;
        }

        .presentation-counter-separator {
          color: #ccc;
        }

        .presentation-counter-total {
          color: #666;
        }

        .presentation-top-controls {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 8px;
        }

        .presentation-top-controls .btn {
          background: rgba(255, 255, 255, 0.95);
          color: #333;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .presentation-top-controls .btn:hover {
          background: #ffffff;
          color: #3b82f6;
        }

        .presentation-click-zone {
          position: absolute;
          top: 80px;
          bottom: 80px;
          width: 120px;
          cursor: pointer;
          z-index: 5;
        }

        .presentation-click-zone:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        .presentation-click-left {
          left: 0;
        }

        .presentation-click-right {
          right: 0;
        }
      `}</style>
        </div>
    );
}

export default PresentationView;
