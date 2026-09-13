const fs = require('fs');
const path = require('path');
const htmlToDocx = require('html-to-docx');

function markdownToHtml(md) {
  let html = md;

  // Escape special chars except markdown markers
  html = html.replace(/\r\n/g, '\n');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<p style="color:#555;font-style:italic;border-left:3px solid #ff5a36;padding-left:10px;">$1</p>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr style="border:0;border-top:1px solid #ccc;margin:20px 0;"/>');

  // Bold and Italics
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<b><i>$1</i></b>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
  html = html.replace(/\*(.*?)\*/gim, '<i>$1</i>');

  // Code snippets
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f4f4f4;padding:2px 5px;border-radius:3px;font-family:monospace;">$1</code>');

  // Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  let finalLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) {
        continue; // delimiter row
      }
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      if (!inTable) {
        inTable = true;
        tableHtml = '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;margin:16px 0;font-family:Arial,sans-serif;font-size:11pt;">\n<thead>\n<tr style="background:#f8f9fa;">';
        cells.forEach(c => { tableHtml += `<th style="text-align:left;padding:8px;border:1px solid #ddd;">${c}</th>`; });
        tableHtml += '</tr>\n</thead>\n<tbody>\n';
      } else {
        tableHtml += '<tr>';
        cells.forEach(c => { tableHtml += `<td style="padding:8px;border:1px solid #ddd;">${c}</td>`; });
        tableHtml += '</tr>\n';
      }
    } else {
      if (inTable) {
        tableHtml += '</tbody>\n</table>\n';
        finalLines.push(tableHtml);
        inTable = false;
        tableHtml = '';
      }
      finalLines.push(lines[i]);
    }
  }
  if (inTable) {
    tableHtml += '</tbody>\n</table>\n';
    finalLines.push(tableHtml);
  }

  html = finalLines.join('\n');

  // Lists
  html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
  // Clean nested duplicate uls
  html = html.replace(/<\/ul>\s*<ul>/gim, '');

  // Ordered lists
  html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li>$2</li>');

  // Paragraphs
  const pLines = html.split('\n');
  const wrapped = pLines.map(l => {
    const t = l.trim();
    if (!t) return '';
    if (t.startsWith('<h') || t.startsWith('<p') || t.startsWith('<ul') || t.startsWith('<ol') || t.startsWith('<li') || t.startsWith('<table') || t.startsWith('<tr') || t.startsWith('<td') || t.startsWith('<th') || t.startsWith('</') || t.startsWith('<hr')) {
      return l;
    }
    return `<p>${l}</p>`;
  });

  return wrapped.join('\n');
}

async function convertFutureWork() {
  const rootMdPath = path.resolve(__dirname, '..', 'FUTURE_WORK.md');
  const rootDocxPath = path.resolve(__dirname, '..', 'FUTURE_WORK.docx');
  const docsDocxPath = path.resolve(__dirname, 'docs', 'FUTURE_WORK.docx');

  console.log(`Reading: ${rootMdPath}`);
  const mdContent = fs.readFileSync(rootMdPath, 'utf8');
  const innerHtml = markdownToHtml(mdContent);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HabbitTracker — Future Work & Product Roadmap</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #222; }
    h1 { font-size: 22pt; color: #ff5a36; margin-bottom: 8pt; }
    h2 { font-size: 16pt; color: #02baa8; margin-top: 18pt; margin-bottom: 6pt; border-bottom: 1px solid #eee; padding-bottom: 4pt; }
    h3 { font-size: 13pt; color: #333; margin-top: 12pt; margin-bottom: 4pt; }
    p { margin: 4pt 0 8pt; }
    ul, ol { margin: 4pt 0 8pt 20pt; }
    li { margin-bottom: 3pt; }
    table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
    th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8pt; font-weight: bold; }
    td { border: 1px solid #cbd5e1; padding: 6pt 8pt; }
    code { font-family: Consolas, monospace; background-color: #f1f5f9; padding: 2pt 4pt; font-size: 9.5pt; }
  </style>
</head>
<body>
  ${innerHtml}
</body>
</html>`;

  const docxOptions = {
    title: 'HabbitTracker Future Work Roadmap',
    description: 'Comprehensive Roadmap for Gemini AI Coach, Universal Mobile Auto-Fit, and Pro Subscriptions',
    creator: 'HabbitTracker Product Team',
    header: true,
    footer: true,
    font: 'Calibri'
  };

  console.log('Generating DOCX buffer...');
  const docxBuffer = await htmlToDocx(fullHtml, null, docxOptions);

  fs.writeFileSync(rootDocxPath, docxBuffer);
  console.log(`Saved to root: ${rootDocxPath}`);

  // Also ensure docs directory exists and save copy
  const docsDir = path.resolve(__dirname, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  fs.writeFileSync(docsDocxPath, docxBuffer);
  console.log(`Saved to docs folder: ${docsDocxPath}`);

  console.log('✅ Conversion completed successfully!');
}

convertFutureWork().catch(err => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
