// JMHC website Worker.
// Serves the built site from _site, and handles GitHub sign-in for the /admin editor.
// Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET under the Worker's Settings > Variables and Secrets.

const callbackPage = (status, content) => `<!doctype html><html><body><script>
(function () {
  function receive(e) {
    window.opener.postMessage('authorization:github:${status}:' + JSON.stringify(${content}), e.origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script><p>Signing you in…</p></body></html>`;

const html = (body) => new Response(body, { headers: { "Content-Type": "text/html;charset=UTF-8" } });

async function auth(request, env) {
  const url = new URL(request.url);
  if (!env.GITHUB_CLIENT_ID) return new Response("Editor sign-in is not set up yet: GITHUB_CLIENT_ID is missing.", { status: 500 });
  const state = crypto.randomUUID();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", `${url.origin}/api/callback`);
  authorize.searchParams.set("scope", "repo,user");
  authorize.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Set-Cookie": `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function callback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = ((request.headers.get("Cookie") || "").match(/decap_oauth_state=([^;]+)/) || [])[1];
  if (!code || !state || state !== saved) {
    return html(callbackPage("error", JSON.stringify({ message: "Sign-in could not be verified. Please try again." })));
  }
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "jmhc-site-admin" },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
  });
  const data = await res.json();
  if (!data.access_token) {
    return html(callbackPage("error", JSON.stringify({ message: data.error_description || "GitHub did not return a token." })));
  }
  return html(callbackPage("success", JSON.stringify({ token: data.access_token, provider: "github" })));
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/auth") return auth(request, env);
    if (pathname === "/api/callback") return callback(request, env);
    return env.ASSETS.fetch(request);
  },
};
