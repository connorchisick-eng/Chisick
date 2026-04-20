/**
 * Inline, blocking script that sets [data-theme] on <html> before the
 * first paint. Must run before any stylesheet loads — otherwise the
 * light-mode palette flashes before JS hydrates. Kept tiny.
 */
const SCRIPT = `(() => {
  try {
    var stored = localStorage.getItem('tabby-theme');
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = stored === 'light' || stored === 'dark' ? stored : system;
    document.documentElement.setAttribute('data-theme', theme);
  } catch (_) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();`;

export function ThemeInit() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
