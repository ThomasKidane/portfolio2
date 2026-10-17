/// <reference types="vite/client" />
declare module '*.mdx' {
  import type { ComponentType } from 'react';
  const MDXContent: ComponentType<{ components?: Record<string, unknown> }>;
  export default MDXContent;
}
declare module '*.json' {
  const value: unknown;
  export default value;
}
