declare module 'html2canvas';
declare module '@lhci/*';
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '@/components/*';
declare module '@/components/ui/*';

// relax next-intl missing exports by adding minimal types
declare module 'next-intl/server' {
  export function getMessages(locale: string): Promise<Record<string, string>>;
  export function getRequestConfig(): any;
}
