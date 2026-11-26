# ROCK B2B agent skills

These repository skills follow the Agent Skills format and are stored in `.github/skills/<skill-name>/SKILL.md`.

| Skill | Use it for |
|---|---|
| [ui-ux-design-review](ui-ux-design-review/SKILL.md) | Reviewing and improving the product interface, visual system, Arabic/English typography, accessibility, and interaction states. |
| [react-best-practices](react-best-practices/SKILL.md) | Implementing or refactoring React components, hooks, forms, and frontend state safely. |
| [responsive-testing](responsive-testing/SKILL.md) | Verifying desktop, tablet, and mobile layouts, RTL behavior, and user flows. |
| [security-review](security-review/SKILL.md) | Reviewing authentication, authorization, data handling, uploads, payments, and prototype-to-production boundaries. |
| [github-actions-debugging](github-actions-debugging/SKILL.md) | Diagnosing CI failures and maintaining reliable GitHub Actions checks. |
| [deployment-verification](deployment-verification/SKILL.md) | Checking preview and production deployments, commit provenance, configuration, caching, and release readiness. |

## Shared rules

- Read the applicable project documents and current code before making assumptions.
- Use synthetic data only. The current demo is not approved for real customer, finance, banking, or tax operations.
- Preserve existing business behavior and security boundaries.
- Run the relevant repository checks and report exactly what was and was not verified.
- Never expose credentials or claim production readiness based only on a successful frontend build.

See [GitHub's Agent Skills documentation](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) for supported skill structure and behavior.
