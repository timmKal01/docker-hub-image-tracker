const BASE_URL = 'https://hub.docker.com/v2/repositories';

function normalizeRepository(repository) {
    return repository.includes('/') ? repository : `library/${repository}`;
}

export async function fetchImageTags({ repository, daysBack, maxResults }) {
    const repoPath = normalizeRepository(repository.trim());
    const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const url = new URL(`${BASE_URL}/${repoPath}/tags`);
    // Counterintuitively, plain "last_updated" sorts newest-first on this API — "-last_updated"
    // sorts oldest-first (reverse of the usual DRF ordering convention). Confirmed live.
    url.searchParams.set('ordering', 'last_updated');
    url.searchParams.set('page_size', String(Math.min(maxResults, 100)));

    const res = await fetch(url, { headers: { Connection: 'close' } });
    if (res.status === 404) {
        throw new Error(`Repository "${repoPath}" was not found on Docker Hub.`);
    }
    if (!res.ok) {
        throw new Error(`Docker Hub API request failed: ${res.status} ${res.statusText}`);
    }
    const body = await res.json();

    const tags = [];
    for (const tag of body.results ?? []) {
        const lastUpdated = new Date(tag.last_updated);
        if (lastUpdated < cutoff) break; // results are newest-first, so we can stop early
        tags.push({
            repository: repoPath,
            tag: tag.name,
            digest: tag.digest,
            fullSizeBytes: tag.full_size,
            contentType: tag.content_type,
            tagStatus: tag.tag_status,
            lastUpdated: tag.last_updated,
            lastPushed: tag.tag_last_pushed,
            lastPulled: tag.tag_last_pulled,
            lastUpdaterUsername: tag.last_updater_username,
            architectures: (tag.images ?? []).map((img) => img.architecture).filter(Boolean),
            dockerHubUrl: `https://hub.docker.com/r/${repoPath}/tags?name=${encodeURIComponent(tag.name)}`,
        });
        if (tags.length >= maxResults) break;
    }

    return tags;
}
