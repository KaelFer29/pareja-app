const ALLOWED_NEXT = new Set(['reset-password', 'email-confirmed']);
const ANDROID_PACKAGE = 'com.kaelfernandez.pareja';

function page(next: string) {
  const safeNext = ALLOWED_NEXT.has(next) ? next : 'reset-password';
  return `<!doctype html>
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
      p { max-width: 28rem; line-height: 1.45; }
      a.button {
        display: inline-block;
        margin-top: 16px;
        padding: 14px 22px;
        border-radius: 999px;
        background: #d0668a;
        color: #fff;
        font-weight: 700;
        text-decoration: none;
      }
      .muted { color: #937e73; font-size: 0.95rem; }
    </style>
  </head>
  <body>
    <div>
      <p id="status">Toca el boton para volver a Pareja.</p>
      <p class="muted">Si no pasa nada, abre el enlace otra vez desde el correo en este telefono.</p>
      <a class="button" id="open" href="pareja://auth/${safeNext}">Abrir Pareja</a>
    </div>
    <script>
      (function () {
        var allowed = ${JSON.stringify([...ALLOWED_NEXT])};
        var params = new URLSearchParams(window.location.search);
        var next = params.get('next') || ${JSON.stringify(safeNext)};
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
        var path = 'auth/' + next + (query ? '?' + query : '');
        var deep = 'pareja://' + path;
        var intent =
          'intent://' +
          path +
          '#Intent;scheme=pareja;package=${ANDROID_PACKAGE};end';
        var isAndroid = /Android/i.test(navigator.userAgent || '');
        var target = isAndroid ? intent : deep;
        var link = document.getElementById('open');
        link.setAttribute('href', target);
        try {
          window.location.replace(target);
        } catch (e) {}
        setTimeout(function () {
          document.getElementById('status').textContent =
            'Si Pareja no se abrio, toca Abrir Pareja.';
        }, 800);
      })();
    </script>
  </body>
</html>`;
}

Deno.serve((req) => {
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || 'reset-password';
  return new Response(page(next), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
});
