# Admin Panel Implemented Fixes

Updated on 2026-06-20.

## Frontend fixes

- Added filters and reset actions to product and tender report lists: text search, entity id, company id, type, status, and date range.
- Added API error handling to report list loading, delete actions, and ban decisions.
- Added mandatory resolution reason prompts before banning a product or tender from a report.
- Report ban actions now try to patch the report lifecycle fields after the target entity is banned.
- Fixed `Upload` so delete emits the actual upload id instead of `null`.
- Fixed arbitration chat listener cleanup by storing and removing only the component's own handler.
- Added visible API errors for arbitration loading, chat loading, message loading, file upload, and message send.
- Restricted arbitration `patch` payload to editable fields instead of sending the whole nested deal object.
- Added login email validation and replaced mixed English/Chinese login text with Russian labels.
- Added UI-level guard for staff role assignment: only `superadmin` can choose staff roles in the user form.
- Added mandatory comments for product and truck moderation reject/ban actions.
- Changed development API defaults to `http://localhost:3030` to avoid accidental writes to production.
- Added dashboard error and empty states for failed or empty stats responses.
- Added transaction filters by type, transaction type, status, user id, company id, deal id, and date range.
- Added API error handling for transaction list loading.

## Verification

- `eslint --ext .js,.vue src` passed after these changes.
- Production build is still expected to fail until the old webpack/node-sass toolchain is updated or the project is run under a compatible Node environment. The local workspace has `node-sass@5` but no `sass` package installed.
