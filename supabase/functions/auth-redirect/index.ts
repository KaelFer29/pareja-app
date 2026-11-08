const ALLOWED_NEXT = new Set(['reset-password', 'email-confirmed']);

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pareja</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        background: #fffaf7;
        color: #3a2a23;
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 24px;
        text-align: center;
      }
      p { max-width: 28rem; line-height: 1.4; }
    </style>
  </head>
  <body>
    <p>Abriendo Pareja…</p>
    <script>
      (function () {
        var allowed = ${JSON.stringify([...ALLOWED_NEXT])};
        var params = new URLSearchParams(window.location.search);
        var next = params.get('next') || 'reset-password';
        if (allowed.indexOf(next) === -1) next = 'reset-password';
        params.delete('next');
        var hash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash;
        var hashParams = new URLSearchParams(hash);
        hashParams.forEach(function (value, key) {
          if (!params.has(key)) params.set(key, value);
        });
        var query = params.toString();
        var target = 'pareja://auth/' + next + (query ? '?' + query : '');
        window.location.replace(target);
        setTimeout(function () {
          document.querySelector('p').textContent =
            'Si Pareja no se abrió, vuelve al correo y toca el enlace otra vez.';
        }, 1500);
      })();
    </script>
  </body>
</html>`;

Deno.serve((_req) => {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
});
