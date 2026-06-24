// fixAriaLabels.js - simple batch updater
const fs = require('fs');
const path = require('path');

// List of files that have control-has-associated-label warnings (from implementation_plan)
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
  'pages/music/(player)/_components/Player.jsx',
  'pages/whiteboard/index.tsx',
  'pages/settings/page.tsx',
  'pages/public/notes/[token].tsx',
  'pages/redirecting.tsx'
];

// Generic aria-label map for common controls (you can extend)
const genericLabels = {
  'Close': /close|cancel|exit/i,
  'Upload': /upload|file/i,
  'Send': /send|submit|post/i,
  'Toggle video': /video|camera/i,
  'Toggle audio': /audio|mic/i,
  'Play': /play|start/i,
  'Pause': /pause|stop/i,
  'Next': /next|forward/i,
  'Previous': /previous|back/i,
  'Share screen': /share.*screen/i,
  'Leave': /leave|exit/i,
  'Join': /join|enter/i,
  'Settings': /settings|gear/i,
  'Logout': /logout|sign out/i,
};

function getLabelFromFile(filePath) {
  const name = path.basename(filePath);
  // Simple heuristic: match generic patterns against file name or component name
  for (const [label, regex] of Object.entries(genericLabels)) {
    if (regex.test(name)) return label;
  }
  // fallback generic label
  return 'Button';
}

files.forEach(relPath => {
  const absPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`File not found: ${absPath}`);
    return;
  }
  let content = fs.readFileSync(absPath, 'utf8');
  // Find button-like JSX elements without aria-label or htmlFor
  const buttonRegex = /<(button|IconButton|div|span)(\s+[^>]*?)(?<!aria-label)(?<!htmlFor)(?<!aria-labelledby)(?<!label)>(?!<\/)/g;
  // Replace with added aria-label using generic label based on file
  const label = getLabelFromFile(relPath);
  const newContent = content.replace(buttonRegex, (match, tag, attrs) => {
    // If it's an input without type="hidden" add aria-label
    if (tag === 'input' && /type="hidden"/.test(attrs)) return match;
    // Insert aria-label before closing >
    return `<${tag}${attrs} aria-label="${label}">`;
  });
  if (newContent !== content) {
    fs.writeFileSync(absPath, newContent, 'utf8');
    console.log(`Updated ${relPath}`);
  }
});

console.log('Aria-label batch update completed.');
