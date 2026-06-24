/**
 * Augments React's StyleHTMLAttributes to recognize styled-jsx's
 * `jsx` and `global` boolean props on <style> elements.
 *
 * Without this, TypeScript / react-doctor flags them as unknown properties
 * on every <style jsx global>{...}</style> tag in the Pages Router.
 */
import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> {
    /** styled-jsx: scopes styles to the current component */
    jsx?: boolean;
    /** styled-jsx: makes scoped styles apply globally */
    global?: boolean;
  }
}
