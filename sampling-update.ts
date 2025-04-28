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

const workspaceModule = git({
    cwd: '.',
})

const status = await outputSubmodule.index.status()
outputSubmodule.branches.checkout({
    target: 'main',
})
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

await workspaceModule.index.add('output')
const untrackedFiles = (await workspaceModule.index.status()).untracked.map(
    (d) => d.path,
)

if (untrackedFiles.length !== 0) {
    await workspaceModule.index.add(untrackedFiles)
}

await workspaceModule.commits.create('Regular Data Update(Workspace)')
await workspaceModule.commits.push({
    branch: 'main',
})

console.log('Workspace Module Pushed to GitHub!')
