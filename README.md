# RPITSSR Security Remediation Guide

> **Purpose:** this is an implementation checklist for the security audit findings. Apply the items in priority order, test each change, and record the pull request or deployment that closes it.
>
> **Important:** the audit found exposed user data in a database dump. Do not copy that data, passwords, access tokens, email addresses, or hashes into issues, commits, screenshots, or this document.

## Start here

| Priority | Finding | Risk | Owner action |
| --- | --- | --- | --- |
| P0 | Database dump committed to Git | Credential and personal-data exposure | Contain exposure, remove the dump, rotate affected credentials and tokens, then purge Git history with team approval. |
| P1 | Public book endpoint returns borrower records | Student/borrower personal-data disclosure | Split public book responses from administrative borrowing responses. |
| P1 | Sub-admin can grant `sub_admin` privilege | Privilege escalation | Restrict role assignment and user-management mutations to `admin`. |
| P1 | API can return debug/route-error details | Information disclosure | Make every `/api/*` authentication failure a JSON `401`; deploy with debug disabled. |
| P2 | Password and role changes leave old tokens usable | Session persistence after account change | Revoke every token for the affected user on sensitive changes. |
| P2 | Facebook metadata fetch can make unsafe outbound requests | Potential server-side request forgery (SSRF) | Strictly validate every destination and redirect, or remove server-side fetching. |
| P2 | Migrations do not reproduce the live schema; broad DB access was observed | Unsafe release/recovery and excessive database privilege | Create complete schema migrations and use a least-privileged database account. |
| P3 | Wildcard CORS and incomplete browser security headers | Hardening gap | Allow only known production origins and add a tested CSP/HSTS policy. |

## How to use this guide

1. Create one branch or pull request per numbered finding.
2. Add a regression test before or alongside the fix.
3. Run the verification commands in the finding's **Done when** section.
4. Do not mark an item complete solely because code was edited; verify its externally observable behavior.

The repository currently has uncommitted work. Re-check the referenced code before changing it, and merge only the intended security fix.

---

## 0. P0 — Remove the committed database dump and treat it as an incident

### What was found

`rpitssr_db.sql` at the repository root is tracked by Git and contains real application user data, including password hashes and an administrative account. Although `.gitignore` now ignores `*.sql`, ignore rules do not remove an already tracked file or erase Git history.

### Implement

1. Limit repository access while the incident is handled. Assume anyone with access to the repository history could have copied the dump.
2. Preserve a secure, access-controlled backup only if the data is genuinely needed. Do not keep it in the project directory or any Git repository.
3. Stop tracking the current dump while retaining a local copy for the incident owner if needed:

   ```bash
   git rm --cached rpitssr_db.sql
   git add .gitignore
   git commit -m "security: remove database dump from repository"
   ```

4. Force a password reset for every affected account and revoke all existing Sanctum tokens. Review the dump for any other secrets before deciding what else must be rotated.
5. Purge the file from all Git history only after a backup, maintainer approval, and coordination with everyone who has a clone or fork. A typical maintainer-run procedure is:

   ```bash
   git filter-repo --path rpitssr_db.sql --invert-paths
   git push --force --all
   git push --force --tags
   ```

   History rewriting changes commit IDs and requires every collaborator to re-clone or carefully repair their clone. It does not remove copies already downloaded by others.
6. Add automated secret scanning (for example, Gitleaks or the Git host's secret scanning), and block SQL dumps, `.env` files, private keys, and backup archives in pre-commit/CI checks.

### Done when

- `git ls-files --error-unmatch rpitssr_db.sql` exits non-zero.
- The current checkout contains no production database dump or user export.
- All affected users have reset credentials and old bearer tokens return `401`.
- After the approved history rewrite, `git log --all -- rpitssr_db.sql` produces no commits.
- A secret-scanning check runs on pull requests and the default branch.

---

## 1. P1 — Prevent public borrower-data exposure

### What was found

The public route `GET /api/books/{id}` calls `AdminBookController::getBook`. That method loads a book's `borrowings` relationship and returns it to unauthenticated callers. Borrowing records include fields such as borrower identity, internal user ID, dates, status, and notes.

Relevant code:

- [Public route](backend/routes/api.php)
- [Book response implementation](backend/app/Http/Controllers/Api/Admin/AdminBookController.php)
- [Borrowing model](backend/app/Models/BookBorrowing.php)

### Implement

1. Create a public catalog controller/resource, such as `PublicBookController` and `PublicBookResource`.
2. Move public routes to that controller. A public response must select only the fields required to display a book and its category.
3. Never eager-load or serialize `borrowings` in a public response. Do not expose `user_id`, borrower name, student ID, borrowing dates, notes, or internal availability history.
4. Keep borrowing records on an authenticated endpoint. Require the appropriate staff role for administrative borrowing data; a student should receive only their own records.
5. Use Laravel API Resources or an explicit array allow-list. Avoid returning an Eloquent model directly from a public endpoint.

Suggested shape:

```php
// Public route
Route::get('/books/{id}', [PublicBookController::class, 'show']);

// PublicBookController::show
$book = Book::query()
    ->with('category')
    ->findOrFail($id);

return new PublicBookResource($book); // Explicit public-field allow-list
```

### Regression tests

```php
$this->getJson('/api/books/1')
    ->assertOk()
    ->assertJsonMissingPath('borrowings')
    ->assertJsonMissingPath('user_id')
    ->assertJsonMissingPath('student_id')
    ->assertJsonMissingPath('student_name');
```

### Done when

- An unauthenticated `GET /api/books/{id}` contains catalog data only.
- Borrowing data is unavailable without authentication and staff authorization.
- A student account cannot request another student's borrowing history.

---

## 2. P1 — Stop sub-admin privilege escalation

### What was found

Administrative routes accept both `admin` and `sub_admin`. In `AdminUserController`, non-admin users are blocked only when assigning the `admin` role; they can still create or promote an account to `sub_admin`, which grants administrative access.

The repository includes `EnsureUserIsSuperAdmin`, but it must be applied to the user-management mutation routes to be effective.

Relevant code:

- [Administrative routes](backend/routes/api.php)
- [User creation and update](backend/app/Http/Controllers/Api/Admin/AdminUserController.php)
- [Role helpers](backend/app/Models/User.php)
- [Super-admin middleware](backend/app/Http/Middleware/EnsureUserIsSuperAdmin.php)

### Implement

Choose and document one of these policies. The first is the recommended, simpler option.

#### Recommended: only `admin` manages users and roles

Place the create, update, delete, and role-changing user routes inside a `super_admin` middleware group. Do not leave duplicate versions of those routes under the broader `admin` group.

```php
Route::middleware(['auth:sanctum', 'super_admin'])
    ->prefix('admin')
    ->group(function () {
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
    });
```

#### Alternative: sub-admins may manage ordinary accounts only

In both `store` and `update`, reject every privileged target role for a non-admin caller:

```php
if (
    isset($validated['role']) &&
    in_array($validated['role'], ['sub_admin', 'admin'], true) &&
    ! $request->user()->isAdmin()
) {
    abort(403, 'Only an administrator may assign privileged roles.');
}
```

Also prevent a sub-admin from editing a privileged account, changing their own role, or changing role fields through another endpoint. Revoke a target user's tokens when their role changes.

### Regression tests

- A `sub_admin` receives `403` when creating a `sub_admin` or `admin`.
- A `sub_admin` receives `403` when promoting a student or teacher to `sub_admin` or `admin`.
- An `admin` can perform approved role transitions.
- No route outside the policy/middleware can change `role`.

### Done when

- Only `admin` can grant or revoke `sub_admin`/`admin` privileges.
- All role transitions are covered by automated feature tests.
- Existing privileged tokens are revoked after a role downgrade or account disablement.

---

## 3. P1 — Return safe API errors and disable production debug mode

### What was found

An unauthenticated request to an API endpoint without an `Accept: application/json` header returned a `500` route error and debug trace instead of a JSON `401`. The local runtime was also configured with debug enabled. In production this exposes framework and filesystem details.

Relevant code:

- [Exception and middleware configuration](backend/bootstrap/app.php)
- [Example environment defaults](backend/.env.example)

### Implement

1. Set production environment values in the deployment environment, never by committing a production `.env` file:

   ```dotenv
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-production-domain.example
   ```

2. Make `api/*` unauthenticated failures return JSON regardless of the request's `Accept` header. Keep the existing `shouldRenderJsonWhen` rule and add an explicit authentication-exception renderer if a redirect to a web `login` route is still possible.

   ```php
   use Illuminate\Auth\AuthenticationException;
   use Illuminate\Http\Request;

   $exceptions->render(function (AuthenticationException $exception, Request $request) {
       if ($request->is('api/*')) {
           return response()->json(['message' => 'Unauthenticated.'], 401);
       }
   });
   ```

3. Rebuild Laravel configuration during deployment after changing environment values:

   ```bash
   php artisan config:clear
   php artisan config:cache
   php artisan route:cache
   ```

4. Configure production error logging so full exception details are retained only in protected logs, not in HTTP responses.

### Done when

The following request returns only a JSON `401`, with no stack trace, filesystem path, or `Route [login] not defined` text:

```bash
curl -i "$API_URL/api/admin/users"
```

Test this both with and without `Accept: application/json`, in a production-like environment where `APP_DEBUG=false`.

---

## 4. P2 — Revoke tokens on password, role, and account changes

### What was found

The frontend stores a bearer token in `localStorage`; API login returns a Sanctum token. Password changes and administrative password resets update the password but do not invalidate every existing token. Logout deletes only the current token.

Relevant code:

- [Frontend token storage](frontend/src/api/client.js)
- [Login and logout](backend/app/Http/Controllers/Api/AuthController.php)
- [Student password change](backend/app/Http/Controllers/Api/StudentPortalController.php)
- [Administrative user updates](backend/app/Http/Controllers/Api/Admin/AdminUserController.php)
- [Sanctum expiry](backend/config/sanctum.php)

### Implement

1. After a successful password change, revoke all tokens for that user:

   ```php
   $user->password = Hash::make($validated['newPassword']);
   $user->save();
   $user->tokens()->delete();
   ```

2. Do the same after an administrator resets a password, changes a role, disables an account, or deletes an account. For a role change, revoke the **target user's** tokens after the change succeeds.
3. Keep single-device logout as `currentAccessToken()->delete()`, but provide a separate **log out of all devices** action that calls `tokens()->delete()`.
4. Keep token lifetime short enough for the risk level. The current seven-day expiry is a maximum, not a replacement for revocation.
5. Treat `localStorage` bearer tokens as vulnerable to any successful XSS. Consider HttpOnly, Secure, SameSite cookies for a first-party SPA, or combine short-lived tokens with a carefully tested CSP.

### Done when

- A token issued before a password reset, password change, role downgrade, or account disablement receives `401` afterward.
- The user can sign in again normally after their password change.
- Tests cover current-device logout and all-devices logout separately.

---

## 5. P2 — Harden Facebook metadata fetching against SSRF

### What was found

The promotional-video metadata feature makes server-side HTTP requests to a Facebook URL, parses its OpenGraph image URL, then fetches that image URL without validating its host, resolved IP address, redirects, type, or size. This is a potential SSRF path. It requires a privileged user and a controllable/redirecting allowed page, so it was not treated as a confirmed exploit during the audit.

Relevant code:

- [Metadata endpoint and scraper](backend/app/Http/Controllers/Api/Admin/AdminPromotionalVideoController.php)
- [Protected metadata route](backend/routes/api.php)

### Implement

The safest option is to stop downloading remote thumbnails on the server and require staff to upload an image through the existing validated upload flow.

If server-side fetching is required, implement all of the following before enabling it:

1. Allow HTTPS only.
2. Parse and validate the hostname on the initial URL **and every redirect**. Use an exact allow-list of the required Facebook hosts; do not accept lookalike hosts.
3. Resolve the hostname and reject loopback, private, link-local, multicast, reserved, and IPv6 local addresses. Revalidate after every redirect to prevent DNS rebinding.
4. Disable automatic redirects and follow only a small, validated number manually.
5. Set strict connection/response timeouts and a small maximum response size.
6. Require an image content type, decode the image server-side, re-encode it to a known safe format, and generate the destination filename yourself.
7. Log rejected destinations without logging secrets, and alert on repeated failures.

### Done when

- Requests to private or non-allow-listed destinations are rejected before any connection is made.
- Redirects to a non-allow-listed or non-public address are rejected.
- Oversized, non-image, and malformed image responses are rejected.
- The behavior is covered by tests using a controlled local mock server; do not test private-network targets against production infrastructure.

---

## 6. P2 — Make deployments reproducible and restrict database access

### What was found

The checked-in Laravel migrations do not create the full application `users` schema and associated application tables used by the running database. The application therefore depends on a SQL import rather than a reproducible migration history. The local database connection also had broad access beyond the application database.

### Implement

1. Create migrations for every required application table and every required `users` column. Do not use a production data dump as schema management.
2. Build a fresh empty test database and confirm `php artisan migrate` produces a working schema without importing `rpitssr_db.sql`.
3. Use a separate database user for this application. Grant only the privileges needed for its one database; do not use a database superuser in staging or production.
4. Store encrypted backups outside the web root and outside Git. Document restore access and retention policy.
5. Add a CI job that creates an empty database, runs migrations, and executes feature tests.

### Done when

- A clean database can migrate and run the application/tests without any SQL dump.
- The deployment account cannot list or modify unrelated databases.
- Backups are not publicly served and are excluded from Git.

---

## 7. P3 — Tighten CORS and browser security headers

### What was found

The CORS configuration falls back to `*` when `CORS_ALLOWED_ORIGINS` is unset. Credentials are currently disabled, so this was not a direct cookie-authentication bypass, but it is too broad for production. Security headers are present but there is no tested Content Security Policy (CSP) or HTTPS-only HSTS policy; the server also disclosed its PHP version.

Relevant code:

- [CORS configuration](backend/config/cors.php)
- [Application security headers](backend/app/Http/Middleware/SecurityHeaders.php)

### Implement

1. Set `CORS_ALLOWED_ORIGINS` in each deployment environment to a comma-separated list of the exact frontend origins. Do not rely on the `*` fallback in production.
2. Allow only the methods and headers the frontend actually uses.
3. Add a CSP in report-only mode first, review browser reports, then enforce it. Tailor script, style, image, font, and media sources to the real frontend; do not paste a generic CSP without testing.
4. Enable HSTS only on HTTPS production domains after confirming that all subdomains are ready for HTTPS.
5. Remove the `X-Powered-By` response header in the web server/PHP configuration.
6. Keep `X-Content-Type-Options`, a suitable frame-embedding policy, `Referrer-Policy`, and `Permissions-Policy`; test that they do not break legitimate pages or embeds.

### Done when

- Requests from an unapproved browser origin do not receive an allowed-origin response.
- Approved frontend origins still work.
- CSP is enforced without console violations on key public, admin, and student pages.
- Production HTTPS responses include an appropriate HSTS header and do not disclose the PHP version.

---

## Validation checklist for every security pull request

Run these from the relevant project directories after implementing a change:

```bash
# Backend
cd backend
php artisan test
php -l app/Http/Controllers/Api/Admin/AdminBookController.php
php -l app/Http/Controllers/Api/Admin/AdminUserController.php
php artisan route:list

# Dependency advisories
composer audit --locked --no-interaction

# Frontend
cd ../frontend
npm run lint
npm run build
npm audit --omit=dev
```

The prior audit found dependency audits clean, PHP syntax valid, and the frontend build successful. Frontend linting still had a React Hooks rule failure in `frontend/src/components/common/BlogCard.jsx`; fix that before using lint as a release gate.

For behavior that could expose personal data or privileges, add Laravel feature tests. A build or lint pass alone cannot prove an authorization fix.

## Closure checklist

- [ ] P0 database dump removed from the current repository, exposure contained, credentials/tokens rotated, and Git history remediation coordinated.
- [ ] Public book APIs have explicit safe response resources and no borrower data.
- [ ] Only `admin` can create, promote, demote, or delete privileged users.
- [ ] API authentication errors are JSON `401` responses even without an `Accept` header; production debug is off.
- [ ] Sensitive account changes revoke all existing tokens.
- [ ] Remote metadata retrieval is removed or protected by full SSRF controls.
- [ ] Migrations reproduce the schema from an empty database; the app uses a least-privileged DB account.
- [ ] Production CORS and security headers are explicitly configured and tested.
- [ ] Security regression tests and secret scanning run in CI.

## Findings not confirmed as exploitable in the audit

The review did not confirm SQL injection, remote code execution through uploads, or stored XSS through the reviewed blog-content path. Keep existing validation and output sanitization in place, and re-test when upload, templating, or query code changes.
