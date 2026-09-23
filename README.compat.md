# J-Space DSH Compatibility Build

This local package recompiles the upstream `@anonyjcy/dsh-j-space` 1.1.1 entry points from TypeScript to plain ESM JavaScript. It preserves the upstream package name, Cordis patch, preset assets, and management behavior, but avoids Node.js refusing to strip TypeScript types from files inside `node_modules`.

Install it through DSH plugin management as a local `link:` dependency. It remains visible to the Desktop Plugin Manager for enable/disable and uninstall actions.
