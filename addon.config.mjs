const addonConfig = {
    id: '8270a15cc5dc520af9db5d8',
    directoryName: '8270a15cc5dc520af9db5d8',
    name: 'BetterInfo',
    author: 'Hazzz895',
    description: 'Добавляет больше информации об исполнителях, плейлистах и альбомах.',
    version: '3.0.0',
    image: 'image.png',
    banner: '',
    libraryLogo: '',
    tags: ['Utility'],
    dependencies: [],
    allowedUrls: ['https://iimuzyka.top'],
    supportedVersions: [
        ">=5.122.0"
    ],
    cssScope: 'global',
    requirements: {
        minHostApi: 1,
        capabilities: ['lifecycle-v1', 'async-start-v1', 'net-per-addon-v1', 'typed-settings-v1'],
    },
}

export default addonConfig
