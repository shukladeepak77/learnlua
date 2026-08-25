import { useCallback, useRef, useState } from "react";

interface Props {
  code: string;
  height?: number;
}

/**
 * Runs Lua entirely client-side via Fengari (a Lua VM compiled to JS).
 * Fengari is imported dynamically so it never ends up in the server bundle
 * and only loads once the user actually wants to run code.
 */
export default function LuaPlayground({ code: initialCode, height = 160 }: Props) {
  const [code, setCode] = useState(initialCode.trim());
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "running" | "ok" | "error">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const run = useCallback(async () => {
    setStatus("running");
    let buffer = "";

    try {
      // fengari-web ships a pre-built browser bundle (unlike the plain "fengari"
      // package, which is written for Node and assumes a bundler statically
      // strips its `process`/`os`/`fs` references — something Vite's dependency
      // optimizer doesn't do reliably). It intentionally omits the `io` library,
      // since there's no real filesystem to back it in a browser, so `io.write`
      // is set up manually below alongside `print`.
      const { lua, lauxlib, lualib, to_luastring, to_jsstring } = await import("fengari-web");

      const L = lauxlib.luaL_newstate();
      lualib.luaL_openlibs(L);

      const argsToStrings = (state: any): string[] => {
        const n = lua.lua_gettop(state);
        const parts: string[] = [];
        for (let i = 1; i <= n; i++) {
          parts.push(to_jsstring(lauxlib.luaL_tolstring(state, i, null)));
          lua.lua_pop(state, 1);
        }
        return parts;
      };

      // Override the global `print` so output is captured instead of going to
      // the console.
      lua.lua_pushjsfunction(L, (state: any) => {
        buffer += argsToStrings(state).join("\t") + "\n";
        return 0;
      });
      lua.lua_setglobal(L, "print");

      // Build a minimal `io` table with just `write`, which (unlike print) does
      // not add a trailing newline or tab-separate its arguments.
      lua.lua_createtable(L, 0, 1);
      lua.lua_pushjsfunction(L, (state: any) => {
        buffer += argsToStrings(state).join("");
        return 0;
      });
      lua.lua_setfield(L, -2, "write");
      lua.lua_setglobal(L, "io");

      const runStatus = lauxlib.luaL_dostring(L, to_luastring(code));

      if (runStatus !== lua.LUA_OK) {
        const err = to_jsstring(lua.lua_tostring(L, -1));
        buffer += `Error: ${err}`;
        setOutput(buffer);
        setStatus("error");
        return;
      }

      setOutput(buffer || "(no output — try using print())");
      setStatus("ok");
    } catch (err) {
      buffer += `Error: ${err instanceof Error ? err.message : String(err)}`;
      setOutput(buffer);
      setStatus("error");
    }
  }, [code]);

  const reset = useCallback(() => {
    setCode(initialCode.trim());
    setOutput("");
    setStatus("idle");
  }, [initialCode]);

  return (
    <div className="my-6 rounded-lg border border-stone-300/60 dark:border-stone-800 overflow-hidden not-prose">
      <div className="flex items-center justify-between bg-stone-200/60 dark:bg-stone-900 px-3 py-1.5 border-b border-stone-300/60 dark:border-stone-800">
        <span className="text-xs font-mono text-stone-500 dark:text-stone-400">Lua Playground</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="text-xs px-2 py-1 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-300/50 dark:hover:bg-stone-800 transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={run}
            disabled={status === "running"}
            className="text-xs px-3 py-1 rounded text-white disabled:opacity-60 hover:brightness-110 transition-[filter] font-medium"
            style={{ backgroundImage: "linear-gradient(135deg, #e8672f 0%, #c1440e 100%)" }}
          >
            {status === "running" ? "Running…" : "▶ Run"}
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        style={{ height }}
        className="w-full resize-y bg-stone-950 text-stone-100 font-mono text-sm p-3 outline-none thin-scroll"
      />

      {(output || status === "running") && (
        <div className="border-t border-stone-300/60 dark:border-stone-800">
          <div className="px-3 py-1 text-xs font-mono text-stone-500 dark:text-stone-400 bg-stone-100/60 dark:bg-stone-900/50">
            Output
          </div>
          <pre
            className={`px-3 py-2 text-sm font-mono whitespace-pre-wrap thin-scroll overflow-x-auto ${
              status === "error"
                ? "text-red-500 dark:text-red-400"
                : "text-stone-800 dark:text-stone-200"
            }`}
          >
            {status === "running" ? "Running…" : output}
          </pre>
        </div>
      )}
    </div>
  );
}
