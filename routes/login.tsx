import { Handlers, PageProps } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";

interface Props {
  errorMessage: string | null;
}

export const handler: Handlers = {
  async GET(_req, ctx) {
    return await ctx.render({
      errorMessage: null,
    });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const token = form.get("token")?.toString();

    const token_env = Deno.env.get("TOKEN")?.toString()

    if (token_env === undefined) {
      return await ctx.render({
        errorMessage: "ENV error",
      });
    }

    if (token !== token_env) {
      return await ctx.render({
        errorMessage: "Token error",
      });
    }
    
    const headers = new Headers();
    const url = new URL(req.url);
    headers.set("location", "/");
    setCookie(headers, {
      name: "token",
      value: token_env, // this should be a unique value for each session
      maxAge: 12000,
      sameSite: "Lax", // this is important to prevent CSRF attacks
      domain: url.hostname,
      path: "/",
      secure: true,
    });
    return new Response(null, {
      status: 303, // See Other
      headers,
    });
  },
};

const Login = (props: PageProps<Props>) => {
  const { errorMessage } = props.data;
  return (
    <div class="min-h-screen flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-xs w-full space-y-4">
        <h1 class="text-3xl font-bold text-center">Login</h1>
        <form class="space-y-4" method="POST">
          {errorMessage && <div class="text-red-500">{errorMessage}</div>}
          <div>
            <input
              type="password"
              name="token"
              required
              class="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
              placeholder="Access Token"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-500 hover:bg-blue [object Promise] text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
