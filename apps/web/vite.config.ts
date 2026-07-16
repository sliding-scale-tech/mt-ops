import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    // Vercel functions have no node_modules; bundle all deps into the server
    // build. In dev, CJS deps break in the module runner, so externalize by
    // default and inline only react-router + Clerk so they share one module
    // instance (otherwise useNavigate() loses its Router context).
    noExternal:
      command === "build" ? true : ["react-router", "@clerk/react-router"],
  },
}));
