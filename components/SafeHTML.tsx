// components/SafeHTML.tsx
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface SafeHTMLProps {
  html: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

export default function SafeHTML({ html, className, tag: Tag = 'div' }: SafeHTMLProps) {
  const sanitized = useMemo(() => {
    if (typeof window === 'undefined') return html; // SSR fallback
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'a', 'h1', 'h2', 'h3', 
        'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
        'img', 'span', 'div', 'sub', 'sup'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'class', 'style', 'title'
      ],
    });
  }, [html]);

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}