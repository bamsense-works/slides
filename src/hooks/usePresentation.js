import { useState, useCallback, useEffect } from 'react';

const DEFAULT_SLIDE = {
  id: crypto.randomUUID(),
  title: 'Untitled Slide',
  content: '<p>Click to edit this slide...</p>',
  notes: '',
  layout: 'default',
};

const createSlide = (overrides = {}) => ({
  ...DEFAULT_SLIDE,
  id: crypto.randomUUID(),
  ...overrides,
});

export function usePresentation() {
  const [presentationTitle, setPresentationTitle] = useState('Untitled Presentation');
  const [slides, setSlides] = useState([createSlide({ title: 'Welcome', content: '<h1>Welcome</h1><p>Start creating your presentation</p>' })]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('presentb-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.presentationTitle) setPresentationTitle(data.presentationTitle);
        if (data.slides?.length) setSlides(data.slides);
        if (data.theme) setTheme(data.theme);
      } catch (e) {
        console.error('Failed to load saved presentation:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('presentb-data', JSON.stringify({
      presentationTitle,
      slides,
      theme,
    }));
  }, [presentationTitle, slides, theme]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const addSlide = useCallback((afterIndex = currentSlideIndex) => {
    const newSlide = createSlide();
    setSlides(prev => {
      const updated = [...prev];
      updated.splice(afterIndex + 1, 0, newSlide);
      return updated;
    });
    setCurrentSlideIndex(afterIndex + 1);
    return newSlide;
  }, [currentSlideIndex]);

  const deleteSlide = useCallback((index) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== index));
    setCurrentSlideIndex(prev => Math.min(prev, slides.length - 2));
  }, [slides.length]);

  const updateSlide = useCallback((index, updates) => {
    setSlides(prev => prev.map((slide, i) => 
      i === index ? { ...slide, ...updates } : slide
    ));
  }, []);

  const updateCurrentSlide = useCallback((updates) => {
    updateSlide(currentSlideIndex, updates);
  }, [currentSlideIndex, updateSlide]);

  const reorderSlides = useCallback((fromIndex, toIndex) => {
    setSlides(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
    if (currentSlideIndex === fromIndex) {
      setCurrentSlideIndex(toIndex);
    } else if (currentSlideIndex >= toIndex && currentSlideIndex < fromIndex) {
      setCurrentSlideIndex(prev => prev + 1);
    } else if (currentSlideIndex <= toIndex && currentSlideIndex > fromIndex) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);

  const duplicateSlide = useCallback((index) => {
    const slide = slides[index];
    const newSlide = createSlide({
      title: `${slide.title} (Copy)`,
      content: slide.content,
      notes: slide.notes,
      layout: slide.layout,
    });
    setSlides(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newSlide);
      return updated;
    });
    setCurrentSlideIndex(index + 1);
  }, [slides]);

  const goToSlide = useCallback((index) => {
    setCurrentSlideIndex(Math.max(0, Math.min(index, slides.length - 1)));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const previousSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const startPresentation = useCallback((fromSlide = 0) => {
    setCurrentSlideIndex(fromSlide);
    setIsPresenting(true);
  }, []);

  const stopPresentation = useCallback(() => {
    setIsPresenting(false);
  }, []);

  const clearPresentation = useCallback(() => {
    setSlides([createSlide({ title: 'Welcome', content: '<h1>Welcome</h1><p>Start creating your presentation</p>' })]);
    setCurrentSlideIndex(0);
    setPresentationTitle('Untitled Presentation');
  }, []);

  const loadSlides = useCallback((newSlides) => {
    if (newSlides?.length) {
      setSlides(newSlides);
      setCurrentSlideIndex(0);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return {
    // State
    presentationTitle,
    slides,
    currentSlideIndex,
    currentSlide,
    isPresenting,
    isGenerating,
    theme,
    
    // Setters
    setPresentationTitle,
    setIsGenerating,
    
    // Slide operations
    addSlide,
    deleteSlide,
    updateSlide,
    updateCurrentSlide,
    reorderSlides,
    duplicateSlide,
    loadSlides,
    
    // Navigation
    goToSlide,
    nextSlide,
    previousSlide,
    
    // Presentation
    startPresentation,
    stopPresentation,
    
    // Other
    clearPresentation,
    toggleTheme,
  };
}

export default usePresentation;
