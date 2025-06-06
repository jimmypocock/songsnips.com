import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["cdk/**/*", "cdk.out/**/*"]
  },
  {
    files: ["components/SearchExample.tsx", "components/UnifiedSearch.tsx", "components/YouTubeSearch.tsx", "components/YouTubeSearchSimple.tsx"],
    rules: {
      "@next/next/no-img-element": "off"
    }
  }
];

export default eslintConfig;