import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');
const must = (cond, msg) => {
	if (!cond) {
		console.error('fail: ' + msg);
		process.exit(1);
	}
};

const files = [
	'src/lib/room.ts',
	'src/lib/people.ts',
	'src/lib/who.ts',
	'src/lib/server/room.ts',
	'src/lib/server/people.ts',
	'src/routes/people/+page.svelte',
	'src/routes/r/+page.svelte',
	'src/routes/r/[handle]/+page.svelte',
	'src/routes/api/rmsg/+server.ts'
];
for (const p of files) must(existsSync(resolve(root, p)), 'missing ' + p);

const layout = read('src/routes/+layout.svelte');
must(layout.includes('href="/people"'), 'nav missing people');
must(layout.includes('href="/r"'), 'nav missing rooms');

must(read('src/routes/people/+page.server.ts').includes('list_people'), 'people page does not load people');
must(read('src/routes/people/+page.svelte').includes('href={p.to}'), 'people results do not link out');
must(read('src/lib/people.ts').includes('people_visible'), 'empty shells are not filtered');
must(read('src/lib/server/people.ts').includes('extra_of'), 'people search ignores products');
must(read('src/routes/people/+page.svelte').includes('any sector'), 'people page has no sector filter');

const rooms = read('src/routes/r/+page.svelte');
must(rooms.includes('?/create'), 'rooms page cannot create a room');
must(rooms.includes('/r/{r.hn}'), 'rooms list does not link into a room');

const thread = read('src/routes/r/[handle]/+page.svelte');
must(thread.includes('/api/rmsg'), 'room thread does not post via /api/rmsg');
must(thread.includes('join'), 'room thread has no join');
must(thread.includes('?/edit'), 'room owner cannot edit');
must(thread.includes('?/drop'), 'room owner cannot delete');

must(read('src/lib/server/room.ts').includes("t: 'rg'"), 'room messages are not type rg');
must(read('src/lib/server/room.ts').includes("t: 'rm'"), 'rooms are not type rm');
must(read('src/lib/server/room.ts').includes('rooms_of'), 'no rooms_of helper');
must(read('src/routes/u/[handle]/+page.svelte').includes('/r/{r.hn}'), 'profile has no rooms list');

const inbox = read('src/routes/inbox/+page.server.ts');
must(inbox.includes('who_of'), 'inbox does not resolve names');
must(inbox.includes('at('), 'inbox does not attach @handles');

must(read('src/routes/profile/+page.svelte').includes('name="tg"'), 'profile form has no tags field');

const readme = read('README.md');
must(readme.includes('| rm |'), 'readme missing rm row type');
must(readme.includes('| rg |'), 'readme missing rg row type');
must(readme.includes('| bu |'), 'readme missing bu row type');

must(!existsSync(resolve(root, 'src/routes/talk')), 'talk leftover');

console.log('community verification passed');
