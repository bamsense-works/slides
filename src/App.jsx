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
      />

      {/* Main Content */}
      <main className="app-main">
        {/* Sidebar */}
        <Sidebar
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={goToSlide}
          onAddSlide={addSlide}
          onDeleteSlide={deleteSlide}
          onDuplicateSlide={duplicateSlide}
          onReorderSlides={reorderSlides}
          onGeneratePresentation={handleGeneratePresentation}
          onImportPresentation={handleImportPresentation}
          isGenerating={isGenerating}
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
        }

        .app-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 24px;
          overflow: hidden;
        }

        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
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
          .app-main {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            height: auto;
            max-height: 200px;
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
          }

          .sidebar-slides {
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
          }

          .slides-list {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
