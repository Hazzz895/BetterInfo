import path from 'node:path'
import { promises as fs } from 'node:fs'

const SETTINGS_FILENAME = 'pulsesync.settings.json'

async function readOptionalJson(file) {
    try {
        return JSON.parse(await fs.readFile(file, 'utf8'))
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null
        }
        throw error
    }
}

function isSameAddon(metadata, config) {
    const matchesId = metadata?.id === config.id
    const matchesStoreId = Boolean(config.storeAddonId && metadata?.storeAddonId === config.storeAddonId)
    return matchesId || matchesStoreId
}

async function findPreviousInstallation(targetDir, config) {
    const metadata = await readOptionalJson(path.join(targetDir, 'metadata.json'))
    if (metadata) {
        if (!isSameAddon(metadata, config)) {
            throw new Error('The target directory belongs to another addon')
        }
        return targetDir
    }

    const addonsDir = path.dirname(targetDir)
    const directories = await fs.readdir(addonsDir, { withFileTypes: true })
    for (const directory of directories) {
        if (!directory.isDirectory() || directory.name.startsWith('.')) {
            continue
        }
        const candidate = path.join(addonsDir, directory.name)
        const candidateMetadata = await readOptionalJson(path.join(candidate, 'metadata.json'))
        if (isSameAddon(candidateMetadata, config)) {
            return candidate
        }
    }
    return targetDir
}

async function preserveSettings(previousDir, stagingDir) {
    const saved = await readOptionalJson(path.join(previousDir, SETTINGS_FILENAME))
    if (saved !== null && (typeof saved !== 'object' || Array.isArray(saved))) {
        throw new Error('Invalid addon settings file')
    }
    const values = { ...saved }
    const legacy = await readOptionalJson(path.join(previousDir, 'handleEvents.json'))
    for (const section of legacy?.sections ?? []) {
        for (const item of section.items ?? []) {
            if (typeof item.id !== 'string' || Object.hasOwn(values, item.id)) {
                continue
            }
            const value = item.value ?? item.bool ?? item.defaultValue ?? item.defaultParameter
            if (typeof value === 'boolean') {
                values[item.id] = value
            }
        }
    }
    const hasSettings = saved !== null || Object.keys(values).length > 0
    if (hasSettings) {
        await fs.writeFile(path.join(stagingDir, SETTINGS_FILENAME), `${JSON.stringify(values, null, 4)}\n`)
    }
    return hasSettings
}

async function preserveStoreIdentity(previousDir, stagingDir, config) {
    const previous = await readOptionalJson(path.join(previousDir, 'metadata.json'))
    const outputFile = path.join(stagingDir, 'metadata.json')
    const metadata = JSON.parse(await fs.readFile(outputFile, 'utf8'))
    const previousStoreId = isSameAddon(previous, config) ? previous?.storeAddonId : undefined
    const storeAddonId = config.storeAddonId || previousStoreId || metadata.storeAddonId
    if (storeAddonId) {
        metadata.storeAddonId = storeAddonId
    }
    metadata.installSource = 'local'
    await fs.writeFile(outputFile, `${JSON.stringify(metadata, null, 4)}\n`)
}

export async function preserveAddonState(targetDir, stagingDir, config) {
    const previousDir = await findPreviousInstallation(targetDir, config)
    const settingsPreserved = await preserveSettings(previousDir, stagingDir)
    await preserveStoreIdentity(previousDir, stagingDir, config)
    return settingsPreserved
}
