import { defineAddonSettings, SettingType, type SettingsSchema } from '@pulsesync/addon-sdk'

const playlistSettings = {
    playlist_index: {
        type: SettingType.BOOLEAN,
        name: 'Порядковый номер треков',
        description: 'Показывать порядковый номер треков рядом с обложкой в плейлистах',
        default: true,
    },
    playlist_date: {
        type: SettingType.BOOLEAN,
        name: 'Дата добавления трека',
        description: 'Показывать дату добавления трека в плейлист рядом с элементами управления в плейлистах',
        default: true,
    },
    playlist_moreOwner: {
        type: SettingType.BOOLEAN,
        name: 'Больше плейлистов от автора',
        description: 'При нажатии на автора в его подзаголовке плейлиста показывать другие плейлисты от него',
        default: true,
    },
    playlist_created: {
        type: SettingType.BOOLEAN,
        name: 'Дата создания',
        description: 'Показывать дату создания плейлиста в его подзаголовке',
        default: true,
    },
    playlist_trackCount: {
        type: SettingType.BOOLEAN,
        name: 'Количество и длительность треков',
        description: 'Показывать количество треков и их суммарную длительность в подзаголовке плейлиста',
        default: true,
    },
    playlist_private: {
        type: SettingType.BOOLEAN,
        name: 'Иконка приватного плейлиста',
        description: 'Показывать иконку рядом с названием плейлиста, если он приватный',
        default: true,
    },
} satisfies SettingsSchema

const albumSettings = {
    album_genre: {
        type: SettingType.BOOLEAN,
        name: 'Жанр',
        description: 'Показывать жанр альбома в его подзаголовке',
        default: true,
    },
    album_date: {
        type: SettingType.BOOLEAN,
        name: 'Полная дата релиза',
        description: 'Изменять год релиза на полную дату в подзаголовке альбома',
        default: true,
    },
    album_trackCount: {
        type: SettingType.BOOLEAN,
        name: 'Количество треков',
        description: 'Показывать количество треков альбома в его подзаголовке',
        default: true,
    },
} satisfies SettingsSchema

const artistSettings = {
    artist_delta: {
        type: SettingType.BOOLEAN,
        name: 'Изменение слушателей за месяц',
        description: 'Показывать изменение количество слушателей артиста за последние 28 дней в его метаданных',
        default: true,
    },
    artist_description: {
        type: SettingType.BOOLEAN,
        name: 'Описание',
        description: 'Добавляет описание артиста в его метаданные',
        default: true,
    },
    artist_likes: {
        type: SettingType.BOOLEAN,
        name: 'Количество лайков',
        description: 'Добавляет счетчик лайков артиста рядом с кнопкой',
        default: true,
    },
    artist_brief: {
        type: SettingType.BOOLEAN,
        name: 'Запрашивать больше информации (🛜)',
        description:
            'Отправляет дополнительный запрос в сеть при открытии страницы артиста на получение дополнительной информации. Это делает намного чаще доступными все поля ниже, которые помечены "(если доступно)". Когда выключено, информация для заполнения таких полей будет доступна только если приложение естественным образом запросило такую информацию ранее.',
        default: true,
    },
    artist_albums: {
        type: SettingType.BOOLEAN,
        name: 'Количество альбомов (если доступно)',
        description: 'Добавляет количество альбомов артиста в его метаданные, если доступно',
        default: true,
    },
    artist_date: {
        type: SettingType.BOOLEAN,
        name: 'Дата рождения (если доступно)',
        description: 'Добавляет дату рождения/регистрации артиста в его метаданные, если доступно',
        default: true,
    },
    artist_end: {
        type: SettingType.BOOLEAN,
        name: 'Дата кончины (если доступно)',
        description: 'Добавляет дату кончины/распада артиста в его метаданные, если доступно',
        default: true,
    },
    artist_aka: {
        type: SettingType.BOOLEAN,
        name: 'Настоящее имя артиста (если доступно)',
        description: 'Добавляет имя артиста в его метаданные, если доступно',
        default: true,
    },
    artist_genres: {
        type: SettingType.BOOLEAN,
        name: 'Жанры (если доступно)',
        description: 'Добавляет жанры артиста в его метаданные, если доступно',
        default: true,
    },
    artist_tracks: {
        type: SettingType.BOOLEAN,
        name: 'Количество треков (если доступно)',
        description: 'Добавляет количество треков артиста в его метаданные, если доступно',
        default: true,
    },
    artist_country: {
        type: SettingType.BOOLEAN,
        name: 'Страна (если доступно)',
        description: 'Добавляет страны проживания (?) / исполнения артиста в его метаданные, если доступно',
        default: true,
    },
    artist_ai: {
        type: SettingType.BOOLEAN,
        name: 'ИИ-исполнитель (🛜)',
        description:
            'Добавляет к названию артиста и к его альбомам иконку, которая указывает на то, что его треки написаны нейронными сетями. Отправляет дополнительный запрос в сеть при открытии страницы артиста.',
        default: false,
    },
} satisfies SettingsSchema

export const settings = defineAddonSettings({
    ...playlistSettings,
    ...albumSettings,
    ...artistSettings,
})

export type Settings = typeof settings.defaults

export function settingsConfig() {
    const items = settings.toConfig().sections.flatMap(section => section.items)
    return {
        sections: [
            { title: 'Плейлисты', schema: playlistSettings },
            { title: 'Альбомы', schema: albumSettings },
            { title: 'Артисты', schema: artistSettings },
        ].map(({ title, schema }) => ({
            title,
            items: items.filter(item => Object.hasOwn(schema, String(item.id))),
        })),
    }
}
