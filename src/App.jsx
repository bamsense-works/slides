import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

import { usePresentation } from './hooks/usePresentation';
import { generatePresentation, isAIConfigured, parsePresentationResponse } from './utils/contentGenerator';

import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { SlideEditor } from './components/SlideEditor';
import { PresentationView } from './components/PresentationView';

import './index.css';

function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {
    presentationTitle,
    setPresentationTitle,
    slides,
    currentSlideIndex,
    currentSlide,
    isPresenting,
    isGenerating,
    setIsGenerating,
    theme,
    addSlide,
    deleteSlide,
    updateSlide,
    updateCurrentSlide,
    reorderSlides,
    duplicateSlide,
    loadSlides,
    goToSlide,
    nextSlide,
    previousSlide,
    startPresentation,
    stopPresentation,
    toggleTheme,
  } = usePresentation();

  const handleGeneratePresentation = useCallback(async (topic, subtopics, slideCount) => {
    if (!isAIConfigured()) {
      toast.error('Please configure your Google AI Studio API key in Settings first.');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(`Generating ${slideCount || 10} slides...`);

    try {
      const result = await generatePresentation(topic, subtopics, slideCount);

      setPresentationTitle(result.title);
      loadSlides(result.slides);

      toast.success(`Generated ${result.slides.length} slides!`, { id: toastId });
      setIsMobileSidebarOpen(false); // Close sidebar on mobile after generation
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate presentation', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, [setIsGenerating, setPresentationTitle, loadSlides]);

  const handleImportPresentation = useCallback(async (jsonText, topic) => {
    setIsGenerating(true);
    const toastId = toast.loading('Importing slides...');

    try {
      const result = parsePresentationResponse(jsonText, topic);

      setPresentationTitle(result.title);
      loadSlides(result.slides);

      toast.success(`Imported ${result.slides.length} slides!`, { id: toastId });
      setIsMobileSidebarOpen(false); // Close sidebar on mobile after import
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import slides', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, [setIsGenerating, setPresentationTitle, loadSlides]);

  const handleSaveProject = useCallback(() => {
    const data = {
      presentationTitle,
      slides,
      theme,
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${presentationTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Project saved!');
  }, [presentationTitle, slides, theme]);

  const handleLoadProject = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.slides && Array.isArray(data.slides)) {
          setPresentationTitle(data.presentationTitle || 'Untitled Presentation');
          loadSlides(data.slides);
          toast.success('Project loaded successfully!');
        } else {
          throw new Error('Invalid project file');
        }
      } catch (error) {
        console.error('Load error:', error);
        toast.error('Failed to load project');
      }
    };
    reader.readAsText(file);
  }, [setPresentationTitle, loadSlides]);

  const handleGoToSlide = (index) => {
      goToSlide(index);
      setIsMobileSidebarOpen(false); // Close sidebar when navigating on mobile
  };

  return (
    <div className="app" data-theme={theme}>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'var(--bg-elevated)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error)',
              secondary: 'var(--bg-elevated)',
            },
          },
        }}
      />

      {/* Top Toolbar */}
      <Toolbar
        presentationTitle={presentationTitle}
        onTitleChange={setPresentationTitle}
        slides={slides}
        onStartPresentation={startPresentation}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Content */}
      <main className="app-main">
        {/* Sidebar - Mobile Overlay */}
        {isMobileSidebarOpen && (
            <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
        )}
        
        <Sidebar
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={handleGoToSlide}
          onAddSlide={addSlide}
          onDeleteSlide={deleteSlide}
          onDuplicateSlide={duplicateSlide}
          onReorderSlides={reorderSlides}
          onGeneratePresentation={handleGeneratePresentation}
          onImportPresentation={handleImportPresentation}
          isGenerating={isGenerating}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Editor Area */}
        <div className="app-editor">
          <div className="editor-header">
            <input
              type="text"
              className="slide-title-input"
              value={currentSlide?.title || ''}
              onChange={(e) => updateCurrentSlide({ title: e.target.value })}
              placeholder="Slide title..."
            />
            <span className="slide-indicator">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
          </div>

          <div className="editor-content">
            {currentSlide && (
              <SlideEditor
                key={currentSlide.id}
                slide={currentSlide}
                onUpdate={updateCurrentSlide}
                presentationTitle={presentationTitle}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="editor-navigation">
            <button
              className="btn btn-ghost"
              onClick={previousSlide}
              disabled={currentSlideIndex === 0}
            >
              ← Previous
            </button>
            <div className="navigation-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`nav-dot ${index === currentSlideIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  title={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              className="btn btn-ghost"
              onClick={nextSlide}
              disabled={currentSlideIndex === slides.length - 1}
            >
              Next →
            </button>
          </div>
        </div>
      </main>

      {/* Presentation Mode Overlay */}
      <AnimatePresence>
        {isPresenting && (
          <PresentationView
            slides={slides}
            currentIndex={currentSlideIndex}
            onClose={stopPresentation}
            onNext={nextSlide}
            onPrevious={previousSlide}
            onGoTo={goToSlide}
          />
        )}
      </AnimatePresence>

      <style>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          background: var(--bg-primary);
        }

        .app-main {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        
        .sidebar-overlay {
            display: none;
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 40;
            backdrop-filter: blur(2px);
        }

        .app-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 24px;
          overflow: hidden;
          width: 100%;
        }

        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
        }

        .slide-title-input {
          flex: 1;
          max-width: 500px;
          padding: 12px 16px;
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          outline: none;
          transition: all var(--transition-fast);
        }

        .slide-title-input:hover {
          background: var(--surface-glass);
        }

        .slide-title-input:focus {
          background: var(--surface-glass);
          border-color: var(--accent-primary);
        }

        .slide-title-input::placeholder {
          color: var(--text-muted);
        }

        .slide-indicator {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          white-space: nowrap;
        }

        .editor-content {
          flex: 1;
          overflow: hidden;
          border-radius: var(--radius-lg);
        }

        .editor-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
        }

        .navigation-dots {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          max-width: 60%;
          padding: 4px;
        }
        
        .navigation-dots::-webkit-scrollbar {
            display: none;
        }

        .nav-dot {
          width: 10px;
          height: 10px;
          padding: 0;
          background: var(--border-default);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .nav-dot:hover {
          background: var(--text-tertiary);
          transform: scale(1.2);
        }

        .nav-dot.active {
          background: var(--accent-primary);
          transform: scale(1.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .app-editor {
            padding: 16px;
          }
          
          .sidebar-overlay {
            display: block;
          }
          
          .editor-header {
             flex-direction: column;
             align-items: flex-start;
             gap: 4px;
             margin-bottom: 12px;
          }
          
          .slide-title-input {
             padding: 8px 12px;
             font-size: var(--text-lg);
             width: 100%;
          }
          
          .slide-indicator {
             padding-left: 12px;
             font-size: var(--text-xs);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
