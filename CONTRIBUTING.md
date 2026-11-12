# Contributing to StageGate

## Development workflow

1. Create a branch from main.
2. Implement a focused change.
3. Add or update relevant tests.
4. Update documentation where required.
5. Run repository validation.
6. Open a pull request.
7. Address review feedback.
8. Merge after approval.

## Branch naming

- feat/<description>
- fix/<description>
- refactor/<description>
- chore/<description>
- docs/<description>
- test/<description>

## Commit messages

StageGate follows Conventional Commits.

Examples:

```text
feat(api): add organization creation endpoint
fix(web): correct organization navigation
refactor(contracts): simplify pagination types
test(api): add tenant isolation tests
chore(repo): configure workspace tooling
docs(architecture): document tenant isolation
```

## Workspace conventions

- Use npm workspaces.
- Keep a single root package-lock.json.
- Use the @stagegate namespace.
- Keep all workspaces private.
- Declare direct dependencies explicitly.
- Avoid circular dependencies.
- Do not import application code into packages.

## Pull request requirements

Every pull request should describe:

- Purpose
- Implementation summary
- Testing performed
- Security considerations
- Breaking changes
- Follow-up work

## Verification

Install dependencies using the root lockfile:

```bash
npm ci
```

Run the complete repository quality gate:

```bash
npm run check
```

To resolve formatting and lint issues:

```bash
npm run lint:fix
npm run format
```

Review changes before committing.

All pull requests must pass workspace validation,
formatting checks, linting, type checking and
applicable automated tests.

See [Coding Standards](docs/development/coding-standards.md)
for detailed engineering conventions.

## Security

Do not commit:

- API keys
- Authentication tokens
- Service account credentials
- Database credentials
- Private keys
- Production environment files

Report security issues through the private
security reporting process.
