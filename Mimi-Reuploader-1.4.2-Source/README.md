# Mimi Reuploader

Приложение для переноса анимаций и звуков Roblox. Можно вставить только ID, а Mimi определит название, тип и владельца по данным Roblox. Встроенный проводник покажет, как установить плагин и применить новые ID в Studio.

## Запуск

1. Распакуй Windows-архив и открой `Mimi Reuploader.exe`.
2. Нажми **Скачать плагин** на экране проводника. В Studio открой **Plugins → Plugins Folder**, помести туда `Mimi-Reuploader-Studio.rbxmx` и перезапусти Studio.
3. В Studio нажми **Mimi Reuploader → Connect**. Плагин обменивается данными с приложением через `127.0.0.1:3100`.
4. Вставь ID или импортируй их из Studio. Выполни перенос и проверь результат в Play.

Профили, API-ключи, cookie и история хранятся в локальных данных Windows, отдельно от EXE. Файл `profile-secrets.json` содержит введённые учётные данные. Не публикуй его вместе с исходниками.

## Сборка

1. Выполни `npm ci --ignore-scripts` в корне и в `src/renderer-react`.
2. Распакуй Electron 42.2.0 для Windows x64 в отдельную папку. Сверь SHA-256 по `node_modules/electron/checksums.json`. Распакуй keytar 7.9.0 napi-v3 для Windows x64 в `node_modules/keytar`.
3. Выполни `npm run build:plugin`, `npm run build:main` и `npm run build:renderer`.
4. Запусти `pack-mimi-win.ps1`, передав папку Electron через `-ElectronDirectory` и рабочую папку сборки через `-StagingDirectory`. Для Windows-значка EXE используй Electron rcedit и `src/assets/app_icon.ico`.

Код распространяется по GPL-3.0-or-later. Подробности в [LICENSE](LICENSE) и [NOTICE.md](NOTICE.md).
