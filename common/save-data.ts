export default async function saveData(
    outputType: string,
    name: string,
    data: string,
) {
    await Deno.writeTextFile(`./${outputType}-output/${name}.json`, data)
    await Deno.writeTextFile(
        `./${outputType}-output/${name}.metadata.json`,
        JSON.stringify(
            {
                updatedAt: new Date().toISOString(),
            },
            null,
            2,
        ),
    )
}
