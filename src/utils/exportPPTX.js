import PptxGenJS from 'pptxgenjs';

/**
 * Convert HTML to PPTX text runs
 */
const htmlToTextRuns = (html) => {
    // Create a temporary div to parse HTML
    const div = document.createElement('div');
    div.innerHTML = html;

    const textRuns = [];

    const processNode = (node, options = {}) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (text.trim()) {
                textRuns.push({
                    text: text,
                    options: { ...options }
                });
            }
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const tag = node.tagName.toLowerCase();
        let newOptions = { ...options };

        switch (tag) {
            case 'h1':
                newOptions = { ...newOptions, fontSize: 44, bold: true, color: '333333' };
                break;
            case 'h2':
                newOptions = { ...newOptions, fontSize: 32, bold: true, color: '333333' };
                break;
            case 'h3':
                newOptions = { ...newOptions, fontSize: 24, bold: true, color: '444444' };
                break;
            case 'strong':
            case 'b':
                newOptions = { ...newOptions, bold: true };
                break;
            case 'em':
            case 'i':
                newOptions = { ...newOptions, italic: true };
                break;
            case 'code':
                newOptions = { ...newOptions, fontFace: 'Courier New', color: '3b82f6' };
                break;
            case 'u':
                newOptions = { ...newOptions, underline: true };
                break;
        }

        for (const child of node.childNodes) {
            processNode(child, newOptions);
        }

        // Add line break after block elements
        if (['h1', 'h2', 'h3', 'p', 'li', 'br'].includes(tag)) {
            textRuns.push({ text: '\n', options: {} });
        }
    };

    processNode(div);

    return textRuns;
};

/**
 * Extract structured content from HTML
 */
const parseSlideContent = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;

    const content = {
        title: '',
        subtitle: '',
        bullets: [],
        paragraphs: [],
        hasCode: false,
    };

    // Find title (h1)
    const h1 = div.querySelector('h1');
    if (h1) {
        content.title = h1.textContent.trim();
    }

    // Find subtitle (h2 or first h3)
    const h2 = div.querySelector('h2');
    if (h2) {
        content.subtitle = h2.textContent.trim();
    }

    // Find bullet points
    const lists = div.querySelectorAll('ul, ol');
    lists.forEach(list => {
        const items = list.querySelectorAll('li');
        items.forEach(item => {
            content.bullets.push(item.textContent.trim());
        });
    });

    // Find paragraphs
    const paragraphs = div.querySelectorAll('p');
    paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text) {
            content.paragraphs.push(text);
        }
    });

    // Check for code
    content.hasCode = div.querySelector('pre, code') !== null;

    return content;
};

/**
 * Export presentation as PPTX
 */
export const exportToPPTX = async (presentationTitle, slides, onProgress) => {
    const pptx = new PptxGenJS();

    // Set presentation properties
    pptx.title = presentationTitle;
    pptx.subject = 'Generated Presentation';
    pptx.author = 'PresentB';

    // Define master slide
    pptx.defineSlideMaster({
        title: 'MAIN',
        background: { color: 'FFFFFF' },
        objects: [
            // Slide number
            {
                text: {
                    text: 'Slide ',
                    options: {
                        x: 9,
                        y: 5.2,
                        w: 1,
                        fontSize: 10,
                        color: '999999',
                    }
                }
            }
        ],
        slideNumber: {
            x: 9.2,
            y: 5.2,
            fontSize: 10,
            color: '999999',
        }
    });

    // Process each slide
    for (let i = 0; i < slides.length; i++) {
        const slideData = slides[i];

        if (onProgress) {
            onProgress((i + 1) / slides.length);
        }

        const slide = pptx.addSlide({ masterName: 'MAIN' });

        // Parse content
        const content = parseSlideContent(slideData.content);

        let yPos = 0.5;

        // Add title if present
        if (content.title) {
            slide.addText(content.title, {
                x: 0.5,
                y: yPos,
                w: 9,
                h: 1,
                fontSize: 40,
                bold: true,
                color: '333333',
                fontFace: 'Arial',
            });
            yPos += 1.2;
        }

        // Add subtitle if present
        if (content.subtitle) {
            slide.addText(content.subtitle, {
                x: 0.5,
                y: yPos,
                w: 9,
                h: 0.6,
                fontSize: 28,
                bold: true,
                color: '555555',
                fontFace: 'Arial',
            });
            yPos += 0.8;
        }

        // Add paragraphs
        if (content.paragraphs.length > 0) {
            const paragraphText = content.paragraphs.join('\n\n');
            slide.addText(paragraphText, {
                x: 0.5,
                y: yPos,
                w: 9,
                h: 1.5,
                fontSize: 18,
                color: '666666',
                fontFace: 'Arial',
                valign: 'top',
            });
            yPos += Math.min(content.paragraphs.length * 0.5, 2);
        }

        // Add bullets
        if (content.bullets.length > 0) {
            const bulletRows = content.bullets.map(bullet => ({
                text: bullet,
                options: {
                    fontSize: 18,
                    color: '666666',
                    bullet: { type: 'bullet', color: '3b82f6' },
                    paraSpaceAfter: 8,
                }
            }));

            slide.addText(bulletRows, {
                x: 0.5,
                y: yPos,
                w: 9,
                h: 4,
                fontFace: 'Arial',
                valign: 'top',
            });
        }

        // If no structured content was found, add raw text
        if (!content.title && !content.subtitle && content.bullets.length === 0 && content.paragraphs.length === 0) {
            const textRuns = htmlToTextRuns(slideData.content);
            if (textRuns.length > 0) {
                slide.addText(textRuns.map(run => ({
                    text: run.text,
                    options: {
                        fontSize: run.options.fontSize || 18,
                        bold: run.options.bold || false,
                        italic: run.options.italic || false,
                        color: run.options.color || '666666',
                        fontFace: run.options.fontFace || 'Arial',
                    }
                })), {
                    x: 0.5,
                    y: 0.5,
                    w: 9,
                    h: 5,
                    valign: 'top',
                });
            }
        }

        // Add slide number
        slide.addText(`${i + 1} / ${slides.length}`, {
            x: 8.5,
            y: 5.2,
            w: 1.2,
            h: 0.3,
            fontSize: 10,
            color: '999999',
            align: 'right',
        });
    }

    // Generate and download
    const filename = `${sanitizeFilename(presentationTitle)}.pptx`;
    await pptx.writeFile({ fileName: filename });
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (name) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

export default exportToPPTX;
