export default async function saveData(name: string, data: string) {
    await Deno.writeTextFile(`./output/${name}.json`, data)
    await Deno.writeTextFile(
        `./output/${name}.metadata.json`,
        JSON.stringify(
            {
                updatedAt: new Date().toISOString(),
            },
            null,
            2,
        ),
    )

    console.log(`Saved ${name} data to output/${name}.json`)
}
