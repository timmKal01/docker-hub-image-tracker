# Docker Hub Image Tracker

Get new or recently updated tags for any public Docker Hub image
repository straight from the official Docker Hub API: tag name,
digest, architectures, size, and push/pull timestamps.

Built for DevOps teams tracking base-image or dependency updates (new
patch versions, new architecture support, unexpected tag churn)
without polling Docker Hub's web UI by hand.

## Input

```json
{
  "repository": "postgres",
  "daysBack": 7,
  "maxResults": 50
}
```

| Field | Type | Description |
|---|---|---|
| `repository` | string (required) | Docker Hub repository to check, e.g. `"postgres"` or `"node"` for an official image, or `"bitnami/postgresql"` for a namespaced one. No namespace assumes `"library/"` (official images). |
| `daysBack` | number | Only return tags updated within this many days. Default `7`, max `365`. |
| `maxResults` | number | Max tags to return. Default `50`, max `100`. |

## Output

One record per matching tag:

```json
{
  "repository": "library/postgres",
  "tag": "14.24-alpine3.23",
  "digest": "sha256:cb5f94ef6a4b3da2ff52083f974c2d6308fbb665b81dd385f5ad7b391c5e48ac",
  "fullSizeBytes": 114143384,
  "contentType": "image",
  "tagStatus": "active",
  "lastUpdated": "2026-08-16T16:07:26.031693Z",
  "lastPushed": "2026-08-16T16:07:26.031693Z",
  "lastPulled": "2026-08-17T19:22:39.752395292Z",
  "lastUpdaterUsername": "doijanky",
  "architectures": ["amd64", "arm64", "arm", "386", "ppc64le", "s390x"],
  "dockerHubUrl": "https://hub.docker.com/r/library/postgres/tags?name=14.24-alpine3.23"
}
```

An unknown repository name returns a clear error rather than an empty
result, so a typo isn't silently mistaken for "no updates."

## How it works

Direct calls to the official [Docker Hub API](https://hub.docker.com/v2/repositories)
(the same API Docker Hub's own website uses) — no proxy, no key, no
scraping. Public registry metadata for any public repository.

## Pricing note

Billed per **search** (one repository check), not per tag returned —
one charge whether the search returns 0 tags or 100.

## Related products

- [npm Package Tracker](https://github.com/timmKal01/npm-package-tracker) — release/deprecation events for npm packages
- [PyPI Download Stats Tracker](https://github.com/timmKal01/pypi-download-stats-tracker) — download-trend counterpart for PyPI packages
