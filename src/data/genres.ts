const genres: Record<string, { label: string; gender: 'm' | 'w' }> = {
    rap: { label: 'Рэп', gender: 'm' },
    rock: { label: 'Рок', gender: 'm' },
    electronics: { label: 'Электроника', gender: 'w' },
    pop: { label: 'Поп', gender: 'm' },
    kpop: { label: 'K-Пoп', gender: 'm' },
    hyperpopgenre: { label: 'Гиперпoп', gender: 'm' },
    indie: { label: 'Инди', gender: 'm' },
    alternative: { label: 'Альтернатив', gender: 'm' },
    edmgenre: { label: 'EDM', gender: 'm' },
    dance: { label: 'Танцевальная Музыка', gender: 'w' },
    rnb: { label: 'R&B (Ритм-н-блюз)', gender: 'm' },
    techno: { label: 'Техно', gender: 'm' },
    disco: { label: 'Диско', gender: 'm' },
    house: { label: 'Хаус', gender: 'm' },
    breakbeatgenre: { label: 'Брейкбит', gender: 'm' },
    funk: { label: 'Фанк', gender: 'm' },
    dub: { label: 'Даб', gender: 'm' },
    dnb: { label: 'D&B (Драм-н-бейс)', gender: 'm' },
    soundtrack: { label: 'Саундтрек', gender: 'm' },
    films: { label: 'Музыка к фильму', gender: 'w' },
    tvseries: { label: 'Музыка к сериалу', gender: 'w' },
    punk: { label: 'Панк', gender: 'm' },
    industrial: { label: 'Индастриал', gender: 'm' },
    triphopgenre: { label: 'Трипхоп', gender: 'm' },
    newwave: { label: 'Новая волна', gender: 'w' },
    bassgenre: { label: 'Басс', gender: 'm' },
    soul: { label: 'Соул', gender: 'm' },
    stonerrock: { label: 'Стоунер-рок', gender: 'm' },
    animated: { label: 'Анимация', gender: 'w' },
    children: { label: 'Музыка для детей', gender: 'w' },
    metal: { label: 'Метал', gender: 'm' },
    numetal: { label: 'Ню-метал', gender: 'm' },
    holiday: { label: 'Праздничная музыка', gender: 'w' },
    phonkgenre: { label: 'Фонк', gender: 'm' },
    folk: { label: 'Фолк', gender: 'm' },
}

const suffixes: Record<string, string> = {
    rus_m: 'Русский',
    rus_w: 'Русская',
    'local-_m': 'Местный',
    'local-_w': 'Местная',
    foreign_m: 'Иностранный',
    foreign_w: 'Иностранная',
    classic_m: 'Классический',
    classic_w: 'Классическая',
    latin_m: 'Латинский',
    latin_w: 'Латинская',
    african_m: 'Африканский',
    african_w: 'Африканская',
}

export function formatGenre(genre: string) {
    if (genres[genre]) {
        return genres[genre].label
    }

    const suffixKeys = Object.keys(suffixes)
    const prefixes = [...new Set(suffixKeys.map(x => x.split('_')[0]))]

    for (const prefix of prefixes) {
        if (genre.startsWith(prefix)) {
            const cleanGenreKey = genre.slice(prefix.length)

            if (genres[cleanGenreKey]) {
                const genreData = genres[cleanGenreKey]

                const suffixKey = `${prefix}_${genreData.gender}`

                if (suffixes[suffixKey]) {
                    return `${suffixes[suffixKey]} ${genreData.label}`
                }
            }
        }
    }

    return genre
}
