console.log('Today:', new Date().toISOString().slice(0, 10))

import { git } from '@roka/git'

import { closeBrowser } from './common/cached-crawl.ts'
import { getRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals } from './kobus/get-terminals.ts'
import removeOldCaches from './remove-old-caches.ts'

const { routes, terminals } = await getTerminals()

const SAMPLES = parseInt(Deno.env.get('UPDATE_SAMPLES') ?? '20', 10)
const sampledRoutes = routes
    .toSorted(() => Math.random() - 0.5)
    .slice(0, SAMPLES)

let progress = 1

for (const route of sampledRoutes) {
    console.log(
        `${progress++}/${SAMPLES} Fetching route plans for ${
            route.departureTerminalId
        } -> ${route.arrivalTerminalId}`,
    )

    const departureTerminal = terminals.get(route.departureTerminalId)!
    const arrivalTerminal = terminals.get(route.arrivalTerminalId)!

    await getRoutePlans(departureTerminal, arrivalTerminal)
}

await closeBrowser()
console.log('Fetch Done')

await removeOldCaches()

async function pushAll(directory: string) {
    const gitModule = git({
        cwd: directory,
    })

    const status = await gitModule.index.status()

    const dirtyFiles = [...status.unstaged, ...status.untracked].map(
        (d) => d.path,
    )

    if (dirtyFiles.length === 0) {
        console.log('No changes to commit')
        return
    }
    console.log('Dirty files:')
    console.log(dirtyFiles.join('\n'))
    // await gitModule.index.add(dirtyFiles)
    await gitModule.commits.create('Regular Data Update', {
        all: true
    })
    await gitModule.commits.push({
        branch: 'main',
    })
    console.log(directory, 'Pushed to GitHub!')
}

await pushAll('kobus-output')
await pushAll('.')
