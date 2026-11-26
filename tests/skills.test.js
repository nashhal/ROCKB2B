import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const skillRoot = new URL("../.github/skills/", import.meta.url);
const expectedSkills = [
  "deployment-verification",
  "github-actions-debugging",
  "react-best-practices",
  "responsive-testing",
  "security-review",
  "ui-ux-design-review",
];

test("all documented ROCK B2B agent skills are discoverable and have valid metadata", async () => {
  const entries = await readdir(skillRoot, { withFileTypes: true });
  const skillDirectories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(skillDirectories, expectedSkills);

  for (const directory of expectedSkills) {
    const skillPath = new URL(`./${directory}/SKILL.md`, skillRoot);
    const content = await readFile(skillPath, "utf8");
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

    assert.ok(frontmatter, `${directory} must start with YAML frontmatter`);

    const metadata = frontmatter[1];
    const name = metadata.match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
    const description = metadata.match(/^description:\s*(.+)$/m)?.[1]?.trim();
    const body = content.slice(frontmatter[0].length).trim();

    assert.equal(name, directory, `${directory} name must match its directory`);
    assert.ok(name.length <= 64, `${directory} name must be at most 64 characters`);
    assert.ok(description, `${directory} must have a non-empty description`);
    assert.ok(description.length <= 1024, `${directory} description must be at most 1024 characters`);
    assert.ok(body.length > 100, `${directory} must include useful instructions`);
  }
});

test("Copilot project instructions point to the shared skill catalogue and safety boundaries", async () => {
  const instructions = await readFile(
    new URL("../.github/copilot-instructions.md", import.meta.url),
    "utf8",
  );

  assert.ok(instructions.includes(".github/skills/"));
  assert.ok(instructions.includes("synthetic data only"));
  assert.ok(instructions.includes("role selector"));
  assert.ok(instructions.includes("npm test"));
  assert.ok(instructions.includes("npm run build"));
});
