# Admin Panel Backend Requirements

Updated on 2026-06-20.

These items need backend support or contract confirmation. The frontend now sends/uses these fields where possible, but a reliable admin workflow requires server-side enforcement.

## Reports lifecycle

- Product and tender reports need explicit lifecycle fields:
  - `status`: `new`, `in_review`, `resolved`, `rejected`
  - `resolution`: examples `product_banned`, `tender_banned`, `no_violation`
  - `resolutionComment`
  - `resolvedByUserId`
  - `resolvedAt`
- `products-reports.patch(id, payload)` and `tenders-reports.patch(id, payload)` should accept lifecycle updates.
- Report list endpoints should support filters:
  - `search`
  - `productId` / `tenderId`
  - `companyId`
  - `type`
  - `status`
  - `dateFrom`
  - `dateTo`
- Blocking a product or tender from a report should be atomic if possible: update entity status and report resolution in one backend operation or transaction.

## Moderation workflow

- `product-moderation.patch` and `truck-moderation.patch` should persist:
  - `status`
  - `comment`
  - `moderatorUserId`
  - `moderatedAt`
- Backend should require a non-empty comment for `rejected` and `banned`.
- Add moderation history/audit endpoints so admins can see previous decisions.
- Consider bulk moderation endpoints with partial success reporting.

## Arbitration workflow

- Current admin screen still works through `deals`. A real arbitration workflow needs backend fields and actions:
  - arbitration status separate from deal status
  - winner side / responsible side
  - compensation amount and currency
  - final decision text
  - decision documents
  - closed by user id and closed at
- Prefer explicit action endpoints over generic deal patch:
  - `arbitrations/:id/resolve`
  - `arbitrations/:id/reject`
  - `arbitrations/:id/request-documents`
  - `arbitrations/:id/add-comment`
- Backend should reject nested unsafe deal payloads and allow only whitelisted editable arbitration fields.

## Roles and permissions

- Backend must enforce that only `superadmin` can create or assign `admin`, `moderator`, or `superadmin` roles.
- User update endpoints should reject privilege escalation even if the frontend is bypassed.
- Admin list/read/edit endpoints should return the current user's allowed role actions so UI can render exact permissions.

## Transactions

- `transactions.find` should support filters:
  - `type`
  - `transactionType`
  - `status`
  - `userId`
  - `companyId`
  - `dealId`
  - `dateFrom`
  - `dateTo`
- Confirm whether transaction create/edit/delete is allowed for admins. If not, frontend routes/buttons should be removed.

## Dashboard stats

- Stats endpoints should return stable empty payloads instead of errors when there is no data:
  - `stats/line`
  - `stats/line-transactions`
  - `stats/pie`
- Add documented response schemas for each stats endpoint.

## Build and deployment

- Decide the supported Node.js version for this admin panel and pin it with `.nvmrc`/CI.
- Either migrate from `node-sass` to Dart Sass (`sass`) with a compatible `sass-loader`, or run builds under an older Node/runtime that `node-sass@5` supports.
- CI should run lint and production build before deployment, because the current local production build is blocked by the old webpack/node-sass stack.

## Files and chat

- Upload endpoints should return structured errors with `code`, `message`, and optional `requestId`.
- Chat message creation should support file-only messages if attachments are valid, or explicitly reject them with a clear validation error.
- Bulk chat delete should return per-id results and failures instead of relying on frontend fallback deletion loops.
