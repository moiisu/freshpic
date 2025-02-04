import { type Config } from "tailwindcss";
import daisyui from "daisyui"

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  plugins: [
    // deno-lint-ignore no-explicit-any
    daisyui as any
  ]
} satisfies Config;
