// scripts/add-aria-labels.js
const fs = require('fs');
const path = require('path');

// List of files to process (relative to project root)
const files = [
  'components/calls/DraggableCallCard.tsx',
  'components/Board/comment-with-attachments.tsx',
  'components/calls/ScreenAnnotation.tsx',
  'components/ChatInterface.tsx',
  'components/calls/Whiteboard.tsx',
  'components/Editor/EditorJS.tsx',
  'components/Inputs/Inputs.tsx',
  'components/account/UploadAvatar.tsx',
  'components/ProfileSidebar.tsx',
  'components/calls/ParticipantTile.tsx',
  'pages/meetings/[id].tsx',
  'pages/music/_components/Player.jsx',
  'pages/whiteboard/index.tsx',
  'pages/settings/page.tsx',
  'pages/public/notes/[token].tsx',
  'pages/redirecting.tsx'
];

function placeholderFor(file) {
  if (/DraggableCallCard/.test(file)) return 'Close';
  if (/UploadAvatar/.test(file)) return 'Upload avatar';
  if (/Player/.test(file)) return 'Play/Pause';
  if (/Whiteboard/.test(file)) return 'Whiteboard tool';
  if (/ScreenAnnotation/.test(file)) return 'Annotate';
  if (/ChatInterface/.test(file)) return 'Send message';
  if (/ParticipantTile/.test(file)) return 'Toggle mute';
  return 'Action';
}

function addAriaLabels(content, placeholder) {
  const regex = /<button(?![^>]*\saria-label)([^>]*)>/gi;
  return content.replace(regex, (match, attrs) => {
    const clean = attrs.trim();
    const space = clean ? ' ' : '';
    return `<button${space}${clean} aria-label="${placeholder}">`;
  });
}

files.forEach(rel => {
  const abs = path.resolve('C:/Users/lenovo/Downloads/conferio/conferio', rel);
  if (!fs.existsSync(abs)) {
    console.warn('File not found:', abs);
    return;
  }
  const src = fs.readFileSync(abs, 'utf8');
  const placeholder = placeholderFor(rel);
  const updated = addAriaLabels(src, placeholder);
  if (updated !== src) {
    fs.writeFileSync(abs, updated, 'utf8');
    console.log('Updated', rel);
  }
});

console.log('Aria‑label insertion complete.');
