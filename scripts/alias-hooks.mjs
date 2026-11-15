// Node module hooks that resolve the app's "@/..." path alias (tsconfig paths)
// to src/*.ts, so plain Node can import the real app modules in scripts.
// Registered by verify-timezones.mjs via module.register().

const SRC = new URL("../src/", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = new URL(specifier.slice(2), SRC);
    return nextResolve(target.href.endsWith(".ts") ? target.href : `${target.href}.ts`, context);
  }
  return nextResolve(specifier, context);
}
