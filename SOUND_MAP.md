# Карта звуков Vibe Island

Рекомендуемый формат: `ogg` для игры, исходники хранить в `wav`. Музыка и окружение должны иметь бесшовные петли. Короткие эффекты лучше подготовить в 3-5 слегка отличающихся вариантах, чтобы частые действия не звучали одинаково.

## Музыка

| Файл | Где играет | Требования |
|---|---|---|
| `audio/music/main-theme.ogg` | Основной игровой экран, первый остров | Спокойная запоминающаяся тема, 90-150 секунд, бесшовная петля |
| `audio/music/island-2-theme.ogg` | Второй остров | Вариация основной темы с более вечерним и сюжетным настроением |
| `audio/music/boat-cutscene.ogg` | Катсцена отплытия | Короткий переход 8-15 секунд, без петли |
| `audio/music/discovery-sting.ogg` | Важная сюжетная находка или открытие острова | Короткая музыкальная отбивка 2-4 секунды |

## Окружение

| Файл | Где играет | Требования |
|---|---|---|
| `audio/ambience/ocean-loop.ogg` | Постоянный фон у острова | Мягкий океан, бесшовная петля |
| `audio/ambience/island-loop.ogg` | На острове | Листья, редкие птицы, легкий ветер |
| `audio/ambience/island-2-night-loop.ogg` | Второй остров | Тихий вечерний ветер и редкие ночные звуки |
| `audio/ambience/campfire-loop.ogg` | Рядом с костром | Треск огня, бесшовная петля с затуханием по расстоянию |
| `audio/ambience/lighthouse-loop.ogg` | Рядом с включенным маяком | Очень тихий механический гул |

## Персонаж и сбор

| Файл | Событие | Варианты |
|---|---|---|
| `audio/player/footstep-grass-01..04.ogg` | Шаг по острову | 4 коротких мягких шага |
| `audio/player/axe-swing-01..03.ogg` | Взмах топором | 3 варианта |
| `audio/player/axe-hit-bush-01..03.ogg` | Удар по кусту | Листья и мягкий удар |
| `audio/player/axe-hit-tree-01..03.ogg` | Удар по дереву | Более твердый древесный удар |
| `audio/player/tree-fall.ogg` | Падение дерева | Короткий тяжелый хруст |
| `audio/player/pickup-01..04.ogg` | Подбор обычного предмета | Легкий приятный щелчок |
| `audio/player/pickup-rare.ogg` | Подбор редкого предмета | Более яркий эффект 1-2 секунды |
| `audio/player/leaves-burst-01..03.ogg` | Разлет листьев после куста | Легкое шуршание |

## Вода, акулы и катер

| Файл | Событие | Требования |
|---|---|---|
| `audio/water/ripple-01..03.ogg` | Появление кругов у сюжетного предмета | Тихий короткий плеск |
| `audio/water/shark-pass-01..03.ogg` | Акула проходит близко к острову | Плеск и движение воды без агрессивного рыка |
| `audio/water/water-burst-01..03.ogg` | Случайный всплеск воды | 3 варианта |
| `audio/boat/engine-start.ogg` | Запуск починенного катера | 2-4 секунды |
| `audio/boat/engine-loop.ogg` | Движение катера в катсцене | Бесшовная короткая петля |
| `audio/boat/engine-stop.ogg` | Остановка катера | Короткое затухание двигателя |
| `audio/boat/no-fuel.ogg` | Попытка воспользоваться катером без топлива | Сухой щелчок/неудачный запуск |

## Постройки и сюжет

| Файл | Событие | Требования |
|---|---|---|
| `audio/world/lighthouse-start.ogg` | Включение маяка | Механический запуск и нарастание света |
| `audio/world/lighthouse-blink-01..02.ogg` | Первые мигания лучей маяка | Короткие электрические импульсы |
| `audio/world/scenario-glint.ogg` | Сюжетный предмет становится заметным | Тихий звонкий маркер |
| `audio/world/scenario-open.ogg` | Открытие ящика/чемодана | Универсальный короткий эффект |
| `audio/world/island-expand.ogg` | Расширение острова | Нарастающий земляной эффект 1-2 секунды |
| `audio/world/resource-unlock.ogg` | Открытие нового ресурса | Яркая короткая отбивка |

## Интерфейс и прогресс

| Файл | Событие | Требования |
|---|---|---|
| `audio/ui/tap-01..03.ogg` | Обычная кнопка | Очень короткий и мягкий щелчок |
| `audio/ui/panel-open.ogg` | Открытие панели | Короткое движение вверх |
| `audio/ui/panel-close.ogg` | Закрытие панели | Обратный эффект |
| `audio/ui/purchase.ogg` | Покупка улучшения | Монета и подтверждение |
| `audio/ui/not-enough-money.ogg` | Недостаточно денег | Негромкий отрицательный сигнал |
| `audio/ui/resource-upgrade.ogg` | Обычный уровень ресурса | Короткий положительный эффект |
| `audio/ui/star-earned.ogg` | Получение звезды ресурса | Более яркий эффект с акцентом |
| `audio/ui/quest-complete.ogg` | Задание выполнено | Короткая победная отбивка |
| `audio/ui/quest-reward.ogg` | Получение награды | Монеты/кристаллы и подтверждение |

## Приоритет производства

1. `main-theme`, `ocean-loop`, `island-loop`, шаги, удары, подбор, обычные UI-клики.
2. Улучшения, задания, расширение острова, костер, вода и акулы.
3. Второй остров, маяк, катер и сюжетные отбивки.

Для сведения: музыку держать примерно на `-18 LUFS`, окружение на `-24 LUFS`, эффекты на `-16..-20 LUFS`. У частых эффектов нужно оставить запас по громкости, потому что несколько звуков могут играть одновременно.

## Ссылки для прослушивания

Подборки ниже ведут на royalty-free материалы Pixabay. Перед добавлением конкретного файла в игру сохранить ссылку на страницу автора и повторно проверить [Pixabay Content License](https://pixabay.com/service/license-summary/). Для петель, коротких эффектов и вариантов одного звука почти всегда потребуется обрезка и сведение.

### Музыка

| Файл | Вариант 1 | Вариант 2 |
|---|---|---|
| `audio/music/main-theme.ogg` | [Calm gaming](https://pixabay.com/music/search/calm%20gaming/) | [Island music](https://pixabay.com/music/search/island/) |
| `audio/music/island-2-theme.ogg` | [Sunset ambient](https://pixabay.com/music/search/sunset%20ambient/) | [Emotional island](https://pixabay.com/music/search/emotional%20island/) |
| `audio/music/boat-cutscene.ogg` | [Cinematic transition](https://pixabay.com/music/search/cinematic%20transition/) | [Short adventure](https://pixabay.com/music/search/short%20adventure/) |
| `audio/music/discovery-sting.ogg` | [Discovery](https://pixabay.com/music/search/discovery/) | [Achievement](https://pixabay.com/music/search/achievement/) |

### Окружение

| Файл | Вариант 1 | Вариант 2 |
|---|---|---|
| `audio/ambience/ocean-loop.ogg` | [Ocean waves loop](https://pixabay.com/sound-effects/search/ocean%20waves%20loop/) | [Calm ocean](https://pixabay.com/sound-effects/search/calm%20ocean/) |
| `audio/ambience/island-loop.ogg` | [Tropical ambience](https://pixabay.com/sound-effects/search/tropical%20ambience/) | [Birds and wind](https://pixabay.com/sound-effects/search/birds%20wind%20ambience/) |
| `audio/ambience/island-2-night-loop.ogg` | [Night ambience](https://pixabay.com/sound-effects/search/night%20ambience/) | [Night wind](https://pixabay.com/sound-effects/search/night%20wind/) |
| `audio/ambience/campfire-loop.ogg` | [Fireplace loop](https://pixabay.com/sound-effects/search/fireplace%20loop/) | [Campfire ambience](https://pixabay.com/sound-effects/search/campfire%20ambience/) |
| `audio/ambience/lighthouse-loop.ogg` | [Mechanical hum](https://pixabay.com/sound-effects/search/mechanical%20hum/) | [Quiet machine loop](https://pixabay.com/sound-effects/search/quiet%20machine%20loop/) |

### Персонаж и сбор

| Файл | Вариант 1 | Вариант 2 |
|---|---|---|
| `audio/player/footstep-grass-01..04.ogg` | [Grass footsteps](https://pixabay.com/sound-effects/search/grass%20footsteps/) | [Soft grass steps](https://pixabay.com/sound-effects/search/soft%20grass%20steps/) |
| `audio/player/axe-swing-01..03.ogg` | [Axe swing](https://pixabay.com/sound-effects/search/axe%20swing/) | [Weapon whoosh](https://pixabay.com/sound-effects/search/weapon%20whoosh/) |
| `audio/player/axe-hit-bush-01..03.ogg` | [Bush rustle](https://pixabay.com/sound-effects/search/bush%20rustle/) | [Leaves hit](https://pixabay.com/sound-effects/search/leaves%20hit/) |
| `audio/player/axe-hit-tree-01..03.ogg` | [Chop wood](https://pixabay.com/sound-effects/search/chop%20wood/) | [Axe wood impact](https://pixabay.com/sound-effects/search/axe%20wood%20impact/) |
| `audio/player/tree-fall.ogg` | [Tree falling](https://pixabay.com/sound-effects/search/tree%20falling/) | [Heavy wood crack](https://pixabay.com/sound-effects/search/heavy%20wood%20crack/) |
| `audio/player/pickup-01..04.ogg` | [Item pickup](https://pixabay.com/sound-effects/search/item%20pickup/) | [Game collect](https://pixabay.com/sound-effects/search/game%20collect/) |
| `audio/player/pickup-rare.ogg` | [Rare item pickup](https://pixabay.com/sound-effects/search/rare%20item%20pickup/) | [Magic collect](https://pixabay.com/sound-effects/search/magic%20collect/) |
| `audio/player/leaves-burst-01..03.ogg` | [Leaves rustle](https://pixabay.com/sound-effects/search/leaves%20rustle/) | [Foliage rustle](https://pixabay.com/sound-effects/search/foliage%20rustle/) |

### Вода, акулы и катер

| Файл | Вариант 1 | Вариант 2 |
|---|---|---|
| `audio/water/ripple-01..03.ogg` | [Water ripple](https://pixabay.com/sound-effects/search/water%20ripple/) | [Small water splash](https://pixabay.com/sound-effects/search/small%20water%20splash/) |
| `audio/water/shark-pass-01..03.ogg` | [Water movement](https://pixabay.com/sound-effects/search/water%20movement/) | [Fin splash](https://pixabay.com/sound-effects/search/fin%20splash/) |
| `audio/water/water-burst-01..03.ogg` | [Water splashing](https://pixabay.com/sound-effects/search/water-splashing/) | [Water impact](https://pixabay.com/sound-effects/search/water%20impact/) |
| `audio/boat/engine-start.ogg` | [Boat engine start](https://pixabay.com/sound-effects/search/boat%20engine%20start/) | [Motor start](https://pixabay.com/sound-effects/search/motor%20start/) |
| `audio/boat/engine-loop.ogg` | [Boat engine](https://pixabay.com/sound-effects/search/boat%20engine/) | [Small motorboat](https://pixabay.com/sound-effects/search/small%20motorboat/) |
| `audio/boat/engine-stop.ogg` | [Engine stop](https://pixabay.com/sound-effects/search/engine%20stop/) | [Motor shutdown](https://pixabay.com/sound-effects/search/motor%20shutdown/) |
| `audio/boat/no-fuel.ogg` | [Engine fail](https://pixabay.com/sound-effects/search/engine%20fail/) | [Dry ignition](https://pixabay.com/sound-effects/search/dry%20ignition/) |

### Постройки и сюжет

| Файл | Вариант 1 | Вариант 2 |
|---|---|---|
| `audio/world/lighthouse-start.ogg` | [Machine start](https://pixabay.com/sound-effects/search/machine%20start/) | [Power up](https://pixabay.com/sound-effects/search/power%20up/) |
| `audio/world/lighthouse-blink-01..02.ogg` | [Electric pulse](https://pixabay.com/sound-effects/search/electric%20pulse/) | [Light switch](https://pixabay.com/sound-effects/search/light%20switch/) |
| `audio/world/scenario-glint.ogg` | [Magic glint](https://pixabay.com/sound-effects/search/magic%20glint/) | [Soft chime](https://pixabay.com/sound-effects/search/soft%20chime/) |
| `audio/world/scenario-open.ogg` | [Chest open](https://pixabay.com/sound-effects/search/chest%20open/) | [Suitcase open](https://pixabay.com/sound-effects/search/suitcase%20open/) |
| `audio/world/island-expand.ogg` | [Earth rumble](https://pixabay.com/sound-effects/search/earth%20rumble/) | [Ground rise](https://pixabay.com/sound-effects/search/ground%20rise/) |
| `audio/world/resource-unlock.ogg` | [Unlock achievement](https://pixabay.com/sound-effects/search/unlock%20achievement/) | [Game unlock](https://pixabay.com/sound-effects/search/game%20unlock/) |

### Интерфейс и прогресс

| Файл | Вариант 1 | Вариант 2 |
|---|---|---|
| `audio/ui/tap-01..03.ogg` | [UI click](https://pixabay.com/sound-effects/search/ui%20click/) | [Soft button](https://pixabay.com/sound-effects/search/soft%20button/) |
| `audio/ui/panel-open.ogg` | [UI open](https://pixabay.com/sound-effects/search/ui%20open/) | [Menu slide](https://pixabay.com/sound-effects/search/menu%20slide/) |
| `audio/ui/panel-close.ogg` | [UI close](https://pixabay.com/sound-effects/search/ui%20close/) | [Menu close](https://pixabay.com/sound-effects/search/menu%20close/) |
| `audio/ui/purchase.ogg` | [Purchase](https://pixabay.com/sound-effects/search/purchase/) | [Coin confirm](https://pixabay.com/sound-effects/search/coin%20confirm/) |
| `audio/ui/not-enough-money.ogg` | [Error soft](https://pixabay.com/sound-effects/search/error%20soft/) | [Negative UI](https://pixabay.com/sound-effects/search/negative%20ui/) |
| `audio/ui/resource-upgrade.ogg` | [Game upgrade](https://pixabay.com/sound-effects/search/game%20upgrade/) | [Positive UI](https://pixabay.com/sound-effects/search/positive%20ui/) |
| `audio/ui/star-earned.ogg` | [Star earned](https://pixabay.com/sound-effects/search/star%20earned/) | [Magic achievement](https://pixabay.com/sound-effects/search/magic%20achievement/) |
| `audio/ui/quest-complete.ogg` | [Quest complete](https://pixabay.com/sound-effects/search/quest%20complete/) | [Victory short](https://pixabay.com/sound-effects/search/victory%20short/) |
| `audio/ui/quest-reward.ogg` | [Reward](https://pixabay.com/sound-effects/search/reward/) | [Coins reward](https://pixabay.com/sound-effects/search/coins%20reward/) |
