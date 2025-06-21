export class CannotFetchPastDateError extends Error {
    constructor() {
        super(`Cannot fetch plans for past dates.`)
        this.name = 'CannotFetchPastDateError'
    }
}
