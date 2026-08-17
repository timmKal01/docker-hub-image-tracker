import { Actor, log } from 'apify';
import { fetchImageTags } from './dockerhub.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { repository, daysBack = 7, maxResults = 50 } = input;

if (!repository) {
    throw new Error('Input "repository" is required, e.g. "postgres" or "bitnami/postgresql".');
}

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const TAG_SEARCH_EVENT = 'tag-search';

const tags = await fetchImageTags({
    repository,
    daysBack: Math.min(daysBack, 365),
    maxResults: Math.min(maxResults, 100),
});

for (const tag of tags) {
    await Actor.pushData(tag);
}

await Actor.charge({ eventName: TAG_SEARCH_EVENT });

log.info(`Pushed ${tags.length} tag(s)`);

await Actor.exit();
