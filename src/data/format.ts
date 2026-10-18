const plurals = new Intl.PluralRules('ru-RU')
const millisecondsPerDay = 86_400_000
const countLabels = {
    track: { one: 'трек', few: 'трека', other: 'треков' },
    album: { one: 'альбом', few: 'альбома', other: 'альбомов' },
}
const durationFormatters = {
    hours: new Intl.NumberFormat('ru-RU', { style: 'unit', unit: 'hour', unitDisplay: 'long' }),
    minutes: new Intl.NumberFormat('ru-RU', { style: 'unit', unit: 'minute', unitDisplay: 'long' }),
    seconds: new Intl.NumberFormat('ru-RU', { style: 'unit', unit: 'second', unitDisplay: 'long' }),
}

export function formatCount(value: number, kind: 'track' | 'album'): string {
    const labels = countLabels[kind]
    const rule = plurals.select(value)
    let label = labels.other
    if (rule === 'one') {
        label = labels.one
    } else if (rule === 'few') {
        label = labels.few
    }
    return `${value.toLocaleString('ru-RU')} ${label}`
}

export function formatDate(value: string, withTime = false): string {
    const parsed = new Date(value)
    if (!Number.isFinite(parsed.getTime())) {
        return ''
    }
    const now = new Date()
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    const day = Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    const daysAgo = Math.round((today - day) / millisecondsPerDay)
    let date: string
    if (daysAgo === 0) {
        date = 'сегодня'
    } else if (daysAgo === 1) {
        date = 'вчера'
    } else {
        date = parsed.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: parsed.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        })
    }
    if (!withTime) {
        return date
    }
    const time = parsed.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    if (daysAgo === 0 || daysAgo === 1) {
        return `${date} в ${time}`
    }
    if (parsed.getFullYear() === now.getFullYear()) {
        return `${date} ${time}`
    }
    return date
}

export function formatDuration(milliseconds: number): string {
    const total = Math.floor(milliseconds / 1000)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    const parts: string[] = []
    if (hours) {
        parts.push(durationFormatters.hours.format(hours))
    }
    if (minutes) {
        parts.push(durationFormatters.minutes.format(minutes))
    }
    if (seconds) {
        parts.push(durationFormatters.seconds.format(seconds))
    }
    return parts.join(' ')
}

export function isBirthday(value: string): boolean {
    const parsed = new Date(value)
    const today = new Date()
    return parsed.getMonth() === today.getMonth() && parsed.getDate() === today.getDate()
}

export function isRecentRelease(value: string, recent: boolean): boolean {
    const age = Date.now() - new Date(value).getTime()
    return age >= 0 && age < (recent ? 90 : 30) * millisecondsPerDay
}

export function formatTrackSummary(trackCount: number, durationMs: number): string {
    if (!trackCount) {
        return ''
    }
    const tracks = formatCount(trackCount, 'track')
    const duration = formatDuration(durationMs)
    return duration ? `${tracks} (${duration})` : tracks
}
