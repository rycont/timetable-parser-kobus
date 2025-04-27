import { git } from '@roka/git'

import { closeBrowser } from './common/cached-crawl.ts'
import { getRoutePlans } from './kobus/get-route-plans/index.ts'
import { getTerminals } from './kobus/get-terminals.ts'

const { routes, terminals } = await getTerminals()

const SAMPLES = 1
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

// Check if the working directory is dirty(Something changed)
// If so, we should make a commit!

const outputSubmodule = git({
    cwd: 'output',
})

const status = await outputSubmodule.index.status()
const updatedFiles = status.unstaged.map((d) => d.path)

if (updatedFiles.length !== 0) {
    console.log('Updated: ')
    console.log(updatedFiles.join('\n'))

    await outputSubmodule.commits.create('Regular Data Update(Submodule)', {
        all: true,
    })
    await outputSubmodule.commits.push()

    console.log('Submodule Pushed to GitHub!')
}

const workspaceModule = git({
    cwd: '.',
})
console.log(await workspaceModule.index.status())
await workspaceModule.commits.create('Regular Data Update(Workspace)', {
    all: true,
})
await workspaceModule.commits.push()

console.log('Workspace Module Pushed to GitHub!')
