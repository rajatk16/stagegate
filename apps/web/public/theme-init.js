(() => {
  let preference = 'system';

  try {
    const saved = window.localStorage.getItem('stagegate.theme');
    if (saved === 'light' || saved === 'dark') {
      preference = saved;
    } else if (saved !== null && saved !== 'system') {
      window.localStorage.removeItem('stagegate.theme');
    }
  } catch {
    // The OS preference still works when browser storage is unavailable.
  }

  const dark =
    preference === 'dark' ||
    (preference === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
})();
