/**
 * Export utilities for presentations
 */

// Generate the full HTML for a slide
const generateSlideHTML = (slide, themeColors = { background: '#ffffff', text: '#333333' }) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
            height: 100%;
            font-family: 'Inter', sans-serif;
            background: ${themeColors.background};
            color: ${themeColors.text};
        }
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px;
        }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        h2 { font-size: 2rem; margin-bottom: 0.75rem; }
        h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        p { font-size: 1.25rem; line-height: 1.6; margin-bottom: 0.75rem; }
        ul, ol { font-size: 1.25rem; padding-left: 2em; margin-bottom: 0.75rem; }
        li { margin-bottom: 0.5rem; }
        img { max-width: 100%; height: auto; }
        .slide-wrapper {
            width: 100%;
            max-width: 1200px;
        }
    </style>
</head>
<body>
    <div class="slide-wrapper">
        ${slide.content || '<p>No content</p>'}
    </div>
</body>
</html>`;
};

/**
 * Export presentation as standalone HTML file
 */
export const exportAsHTML = (title, slides) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
            height: 100%;
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            overflow: hidden;
        }
        
        .presentation {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        
        .slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 60px;
            background: #ffffff;
        }
        
        .slide.active {
            display: flex;
        }
        
        .slide-content {
            width: 100%;
            max-width: 1200px;
        }
        
        .controls {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 20px;
            background: rgba(255,255,255,0.95);
            padding: 10px 20px;
            border-radius: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .controls button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .controls button:hover {
            background: #2563eb;
        }
        
        .controls button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .counter {
            font-size: 14px;
            color: #666;
        }
        
        /* Default content styles */
        h1 { font-size: 3rem; margin-bottom: 1rem; color: #333; }
        h2 { font-size: 2rem; margin-bottom: 0.75rem; color: #333; }
        h3 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #333; }
        p { font-size: 1.25rem; line-height: 1.6; margin-bottom: 0.75rem; color: #444; }
        ul, ol { font-size: 1.25rem; padding-left: 2em; margin-bottom: 0.75rem; }
        li { margin-bottom: 0.5rem; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <div class="presentation">
        ${slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="slide-content">
                    ${slide.content || '<p>No content</p>'}
                </div>
            </div>
        `).join('')}
    </div>
    
    <div class="controls">
        <button id="prevBtn" onclick="prevSlide()">← Previous</button>
        <span class="counter"><span id="current">1</span> / ${slides.length}</span>
        <button id="nextBtn" onclick="nextSlide()">Next →</button>
    </div>
    
    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const total = slides.length;
        
        function showSlide(index) {
            slides.forEach((s, i) => s.classList.toggle('active', i === index));
            document.getElementById('current').textContent = index + 1;
            document.getElementById('prevBtn').disabled = index === 0;
            document.getElementById('nextBtn').disabled = index === total - 1;
        }
        
        function nextSlide() {
            if (currentSlide < total - 1) {
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
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });
    </script>
</body>
</html>`;

    // Create download link
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Export slides as images using canvas
 */
export const exportAsImages = async (title, slides, onProgress) => {
    const images = [];

    for (let i = 0; i < slides.length; i++) {
        if (onProgress) onProgress(i + 1, slides.length);

        // Create an iframe to render the slide
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.width = '1920px';
        iframe.style.height = '1080px';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument;
        doc.open();
        doc.write(generateSlideHTML(slides[i]));
        doc.close();

        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Use html2canvas if available, otherwise generate placeholder
        try {
            if (window.html2canvas) {
                const canvas = await window.html2canvas(doc.body, {
                    width: 1920,
                    height: 1080,
                    scale: 1,
                });
                images.push({
                    name: `slide_${i + 1}.png`,
                    dataUrl: canvas.toDataURL('image/png'),
                });
            }
        } catch (error) {
            console.error('Error capturing slide:', error);
        }

        document.body.removeChild(iframe);
    }

    return images;
};

/**
 * Export as PDF (requires html2canvas and jsPDF)
 */
export const exportAsPDF = async (title, slides, onProgress) => {
    // Check if jsPDF is available
    if (!window.jspdf?.jsPDF) {
        throw new Error('PDF export requires jsPDF library. Please install it first.');
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080]
    });

    for (let i = 0; i < slides.length; i++) {
        if (onProgress) onProgress(i + 1, slides.length);

        if (i > 0) pdf.addPage();

        // Create an iframe to render the slide
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.width = '1920px';
        iframe.style.height = '1080px';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument;
        doc.open();
        doc.write(generateSlideHTML(slides[i]));
        doc.close();

        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            if (window.html2canvas) {
                const canvas = await window.html2canvas(doc.body, {
                    width: 1920,
                    height: 1080,
                    scale: 1,
                });
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
            }
        } catch (error) {
            console.error('Error capturing slide for PDF:', error);
        }

        document.body.removeChild(iframe);
    }

    pdf.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
};

export default {
    exportAsHTML,
    exportAsImages,
    exportAsPDF,
};
