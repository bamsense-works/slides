/**
 * Export presentation as standalone HTML file
 */
export const exportToHTML = (presentationTitle, slides) => {
  const slidesHTML = slides.map((slide, index) => `
    <section class="slide" id="slide-${index}" data-index="${index}">
      <div class="slide-content">
        ${slide.content}
      </div>
    </section>
  `).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentationTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      height: 100%;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #ffffff;
      color: #333333;
      overflow: hidden;
    }
    
    .slide {
      display: none;
      width: 100vw;
      height: 100vh;
      padding: 60px 80px;
      background: #ffffff;
      position: relative;
      z-index: 1;
    }
    
    .slide.active {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .slide-content {
      max-width: 1200px;
      width: 100%;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #333333;
    }
    
    h2 {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333333;
    }
    
    h3 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: #444444;
    }
    
    p {
      font-size: 1.5rem;
      line-height: 1.7;
      margin-bottom: 1rem;
      color: #555555;
    }
    
    ul, ol {
      font-size: 1.5rem;
      line-height: 1.8;
      margin-left: 2rem;
      margin-bottom: 1rem;
      color: #555555;
    }
    
    li {
      margin-bottom: 0.75rem;
    }
    
    li::marker {
      color: #3b82f6;
    }
    
    blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 1.5rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: #666666;
    }
    
    code {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(59, 130, 246, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9em;
      color: #333333;
    }
    
    pre {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    strong {
      color: #333333;
      font-weight: 600;
    }
    
    em {
      color: #555555;
    }
    
    /* Navigation Zones */
    .click-zone {
      position: fixed;
      top: 0;
      bottom: 0;
      width: 15vw;
      z-index: 100;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .click-zone:hover {
      background: rgba(0, 0, 0, 0.02);
    }
    
    .click-zone.left {
      left: 0;
    }
    
    .click-zone.right {
      right: 0;
    }

    /* Counter Pill */
    .slide-counter {
      position: fixed;
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
      z-index: 100;
      color: #666;
      pointer-events: none;
    }
    
    .current-index {
      color: #3b82f6;
      font-weight: 600;
    }
    
    .separator {
      color: #ccc;
    }
    
    /* Progress bar */
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      transition: width 0.3s ease;
      z-index: 101;
    }
  </style>
</head>
<body>
  <div class="progress-bar" id="progress"></div>
  
  ${slidesHTML}
  
  <!-- Navigation Zones -->
  <div class="click-zone left" onclick="prevSlide()" title="Previous (Left Arrow)"></div>
  <div class="click-zone right" onclick="nextSlide()" title="Next (Right Arrow / Space)"></div>
  
  <!-- Counter -->
  <div class="slide-counter">
    <span class="current-index" id="current-index">1</span>
    <span class="separator">/</span>
    <span class="total-count">${slides.length}</span>
  </div>
  
  <script>
    let currentSlide = 0;
    const totalSlides = ${slides.length};
    
    function showSlide(index) {
      document.querySelectorAll('.slide').forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      document.getElementById('current-index').textContent = (index + 1);
      document.getElementById('progress').style.width = ((index + 1) / totalSlides * 100) + '%';
    }
    
    function nextSlide() {
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
        showSlide(currentSlide);
      }
    }
    
    function prevSlide() {
      if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
      }
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        currentSlide = 0;
        showSlide(currentSlide);
      } else if (e.key === 'End') {
        currentSlide = totalSlides - 1;
        showSlide(currentSlide);
      }
    });
    
    // Initialize
    showSlide(0);
  </script>
</body>
</html>`;

  downloadFile(html, `${sanitizeFilename(presentationTitle)}.html`, 'text/html');
};

/**
 * Helper to download a file
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (name) => {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

export default exportToHTML;
