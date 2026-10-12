(() => {
  "use strict";

  if (window.LC_APP_MODE === "public_demo") {
  const ru = {"Home": "Главная", "Explore": "Найти", "Create": "Создать", "Activity": "События", "Profile": "Профиль", "Player": "Игрок", "Creator": "Креатор", "Operator": "Оператор", "Provider": "Провайдер", "Studio": "Студия", "Post": "Пост", "Schedule": "Расписание", "Live": "Сессии", "Audience": "Аудитория", "Overview": "Обзор", "Creators": "Креаторы", "Campaigns": "Кампании", "Performance": "Доказательства", "Integrations": "Интеграции", "Safety": "Безопасность", "Settings": "Настройки", "Business section": "Бизнес-раздел", "Request Pilot": "Обсудить пилот", "Guide": "Гид", "Reset": "Сбросить демо", "Roles": "Роли", "Switch role": "Выбрать роль", "DEMO · LOCAL DATA": "ДЕМО · ЛОКАЛЬНЫЕ ДАННЫЕ", "LC App product experience": "Продукт LC App", "LC App business navigation": "Бизнес-навигация LC App", "Business workspace": "Бизнес-пространство", "Primary navigation": "Основная навигация", "Creator tools": "Инструменты креатора", "Player experience": "Для игрока", "Creator studio": "Студия креатора", "Creator profile": "Профиль креатора", "Your social corner": "Ваш социальный профиль", "Your public identity and controls": "Ваш публичный профиль", "Operator Back Office": "Кабинет оператора", "Provider Back Office": "Кабинет провайдера", "LC Business": "LC Бизнес", "Operator & provider back office": "Кабинеты оператора и провайдера", "Choose the product you want to explore": "Выберите сценарий продукта", "LC APP · INTERACTIVE DEMO": "LC APP · ИНТЕРАКТИВНОЕ ДЕМО", "Discover the People": "Откройте людей", "Behind the Tables.": "За игровыми столами.", "Explore creators, follow your favorites, discover upcoming sessions, and continue to participating licensed operators when available.": "Находите креаторов, подписывайтесь и сохраняйте сессии. В демо переход к оператору только моделируется.", "PLAYER EXPERIENCE": "ДЛЯ ИГРОКА", "Follow the person.": "Подпишитесь на человека.", "Return for the next session.": "Вернитесь к следующей сессии.", "Discover creators, view illustrative profiles and schedules, and preview the licensed-operator handoff journey.": "Знакомьтесь с креаторами, изучайте демонстрационные профили и расписание, попробуйте сценарий перехода к оператору.", "ENTER AS PLAYER": "ВОЙТИ КАК ИГРОК", "ENTER AS CREATOR": "ВОЙТИ КАК КРЕАТОР", "BUSINESS BACK OFFICE": "БИЗНЕС-КАБИНЕТ", "Manage the creator-led path to Live.": "Управляйте путём от креатора к сессии.", "Configuration, creator operations, campaigns, integrations, safety and observed evidence. No invented performance claims.": "Креаторы, кампании, интеграции, безопасность и наблюдаемые действия. Без выдуманных результатов.", "OPERATOR CONSOLE": "КАБИНЕТ ОПЕРАТОРА", "PROVIDER CONSOLE": "КАБИНЕТ ПРОВАЙДЕРА", "LC does not operate the casino.": "LC не управляет казино.", "Gameplay, wallet, deposits, withdrawals, KYC/AML, wagering, settlement and responsible-gaming operations stay with licensed operator/provider infrastructure.": "Игра, кошелёк, платежи, KYC/AML, ставки, расчёты и ответственная игра остаются в лицензированной инфраструктуре оператора и провайдера.", "Live Casino through people": "Live Casino через людей", "For you": "Для вас", "Following": "Подписки", "Follow": "Подписаться", "Like": "Нравится", "Profile preview": "Обзор профиля", "PREVIEW": "ОБЗОР", "SESSION PREVIEW": "ДЕМО-СЕССИЯ", "DEMO LIVE": "ДЕМО-ЭФИР", "LIVE NOW": "В ЭФИРЕ", "UPCOMING": "ПРЕДСТОИТ", "ENDED": "ЗАВЕРШЕНО", "NO SESSION": "НЕТ СЕССИИ", "Illustrative identity · not verified": "Демо-личность · не проверена", "Illustrative profile": "Демонстрационный профиль", "public": "публичный", "published": "публичный", "private": "приватный", "unverified": "не проверено", "verified": "проверено", "active": "активен", "scheduled": "запланировано", "cancelled": "отменено", "completed": "завершено", "not_requested": "доступ не запрошен", "Not requested": "Не запрошено", "Demo Reviewer": "Обозреватель демо", "Demo Company": "Демо-компания", "Demo Casino": "Демо-казино", "Demo Studio": "Демо-студия", "Demo Provider": "Демо-провайдер", "Featured Blackjack creator": "Креатор Blackjack", "Roulette table personality": "Креатор Roulette", "Game Show host": "Ведущий Game Show", "Baccarat creator for premium sessions": "Креатор Baccarat", "Blackjack and poker table explainer": "Креатор Blackjack и Poker", "Evening Blackjack table": "Вечерняя сессия Blackjack", "Roulette community hour": "Сессия сообщества Roulette", "Game Show warm-up": "Знакомство с Game Show", "Premium Baccarat room": "Сессия Baccarat", "Blackjack strategy table": "Разбор Blackjack", "Blackjack dealer building a followable Live Casino audience.": "Дилер Blackjack с демонстрационным социальным профилем.", "Roulette and baccarat sessions with a calm table style.": "Сессии Roulette и Baccarat в спокойном стиле.", "Game-show host focused on community return visits.": "Ведущий Game Show с фокусом на сообщество.", "Baccarat host connecting premium table rhythm with repeat players.": "Ведущий Baccarat с узнаваемым стилем.", "Blackjack and poker creator focused on clear table explainers.": "Креатор Blackjack и Poker с понятными объяснениями.", "An example Blackjack session with Sofia. Follow her profile and save a reason to return.": "Демонстрационная сессия Blackjack с Sofia. Подпишитесь и сохраните повод вернуться.", "Example update: a quieter Roulette and Baccarat session preview. Follow Mia to explore the return journey.": "Пример обновления: сессия Roulette и Baccarat. Подпишитесь на Mia и попробуйте путь возврата.", "Example Game Show update. Explore how a creator can bring followers back.": "Пример обновления Game Show. Посмотрите, как креатор формирует повод вернуться.", "Example Baccarat session with Alex. Save the preview and try the local table room.": "Пример Baccarat с Alex. Сохраните сессию и попробуйте локальную комнату.", "Example Blackjack note. Meet Lilit and explore a scheduled preview.": "Пример заметки Blackjack. Познакомьтесь с Lilit и посмотрите расписание.", "Meet your next dealer": "Найдите своего дилера", "LC App is a social layer for Live Casino. Meet Blackjack and Baccarat dealers, follow them and return to their tables.": "LC App — социальный слой для Live Casino. Найдите дилера, подпишитесь и сохраните следующую сессию.", "Explore the lobby": "Открыть каталог", "Turn discovery into a relationship": "Превратите знакомство в связь", "Like a post, leave a comment and follow a dealer. Open their session preview to try the scripted table, room chat and operator-return journey.": "Оцените пост, оставьте комментарий и подпишитесь. В демо доступны фиксированные раунды, локальный чат и сценарий возврата.", "Meet Sofia": "Познакомиться с Sofia", "See the integration value": "Посмотрите бизнес-сценарий", "Operators can connect discovery to licensed play and measure return journeys. Providers can give existing tables a creator-led distribution channel. These benefits still require pilot validation.": "Оператор может связать поиск креатора с переходом и возвратом. Провайдер — с контекстом своих столов. Эти гипотезы требуют проверки пилотом.", "Inspect operator workspace": "Открыть кабинет оператора", "Next scenario": "Следующий шаг", "Skip walkthrough": "Закрыть гид", "Finish walkthrough": "Завершить гид", "1 · Discover": "1 · Найти", "2 · Social": "2 · Общение", "3 · Business": "3 · Бизнес", "SEARCH": "ПОИСК", "Search": "Найти", "Clear": "Очистить", "Search creators, games or languages": "Поиск креаторов, игр и языков", "FIND A SESSION": "НАЙТИ СЕССИЮ", "Discover people": "НАЙДИТЕ ЛЮДЕЙ", "DISCOVER PEOPLE": "НАЙДИТЕ ЛЮДЕЙ", "Find your next Live table through a Creator.": "Найдите следующую сессию через креатора.", "Explore illustrative creators and preview the path to participating licensed operators.": "Изучите демонстрационные профили и сценарий перехода к лицензированному оператору.", "Connected broadcasts (demo has none)": "Подключённые трансляции (в демо отсутствуют)", "Connected broadcasts": "Подключённые трансляции", "Live now": "В эфире", "Soon": "Скоро", "Creators matched to your social signals.": "Креаторы по вашим предпочтениям.", "Discover dealers · scripted table preview": "Найдите дилера · фиксированные раунды", "OPEN SESSION PREVIEW": "ОТКРЫТЬ ДЕМО-СЕССИЮ", "VIEW SESSION PREVIEW": "ПОСМОТРЕТЬ ДЕМО-СЕССИЮ", "OPEN DEMO SESSION": "ОТКРЫТЬ ДЕМО-СЕССИЮ", "REMIND ME": "НАПОМНИТЬ", "REMINDER SET": "НАПОМИНАНИЕ СОХРАНЕНО", "Remind me": "Напомнить", "Saved": "Сохранено", "Mute Live alerts": "Выключить уведомления", "Live alerts on": "Уведомления включены", "FOLLOWING": "ПОДПИСКА", "CONTENT": "КОНТЕНТ", "Recent updates": "Последние обновления", "SCHEDULE": "РАСПИСАНИЕ", "More return moments": "Следующие сессии", "ABOUT": "О КРЕАТОРЕ", "UPDATES": "ОБНОВЛЕНИЯ", "GAMES": "ИГРЫ", "LANGUAGES": "ЯЗЫКИ", "CREATOR MODE": "РЕЖИМ КРЕАТОРА", "PUBLIC PROFILE": "ПУБЛИЧНЫЙ ПРОФИЛЬ", "View public profile": "Открыть публичный профиль", "TODAY": "СЕГОДНЯ", "Your next return moment is ready.": "Следующая сессия в расписании.", "OPEN LIVE CONTROL": "УПРАВЛЕНИЕ СЕССИЕЙ", "SCHEDULE LIVE": "ЗАПЛАНИРОВАТЬ СЕССИЮ", "Create post": "Создать пост", "Share an update": "Написать обновление", "Plan a return": "Создать повод вернуться", "Live control": "Управление сессией", "Start when eligible": "Запустить, когда готово", "PROFILE VISIBILITY": "ВИДИМОСТЬ ПРОФИЛЯ", "Your Creator profile is visible": "Профиль креатора виден", "MAKE PRIVATE": "СДЕЛАТЬ ПРИВАТНЫМ", "PUBLISH PROFILE": "ПОКАЗАТЬ ПРОФИЛЬ", "CREATE": "СОЗДАТЬ", "Share with followers": "Поделитесь с подписчиками", "Post table context, a short update or what to expect from your next Live session.": "Опишите контекст стола, обновление или следующую сессию.", "Public Creator post": "Публичный пост креатора", "What should your followers know?": "Что должны узнать ваши подписчики?", "Public content · moderation applies": "Публичный контент · правила модерации действуют", "SHARE": "СОХРАНИТЬ ПОСТ", "Your posts": "Ваши посты", "No posts yet.": "Постов пока нет.", "Plan the next Live moment": "Запланируйте следующую сессию", "Followers can save an eligible public session and return to you at the right time.": "Подписчики могут сохранить публичную сессию и вернуться к нужному времени.", "Session title": "Название сессии", "Live table session": "Сессия за столом", "Game": "Игра", "Date and time": "Дата и время", "Operator or studio optional · user claimed": "Оператор или студия (необязательно) · без проверки", "Not verified by LC": "Не проверено LC", "ADD TO SCHEDULE": "ДОБАВИТЬ В РАСПИСАНИЕ", "Followers can save this session after it is public.": "Подписчики смогут сохранить публичную сессию.", "Upcoming": "Предстоящие", "Make private": "Сделать приватной", "Publish": "Показать", "Cancel": "Отменить", "LIVE CONTROL": "УПРАВЛЕНИЕ СЕССИЕЙ", "Start only when the session is ready.": "Запускайте только готовую сессию.", "A session must be scheduled, public and attached to an approved Creator profile before it can go Live.": "Сессия должна быть запланирована, публична и привязана к допущенному профилю. В демо это локальная симуляция.", "Ready to start": "Готовы к запуску", "GO LIVE": "ЗАПУСТИТЬ ДЕМО", "END LIVE": "ЗАВЕРШИТЬ ДЕМО", "LC controls the social signal, not the game.": "LC управляет социальным сигналом, а не игрой.", "AUDIENCE": "АУДИТОРИЯ", "Understand app-owned activity": "Посмотрите локальные действия", "Only observed LC interactions appear here. Commercial impact remains To be validated.": "Здесь только наблюдаемые действия в LC. Коммерческий эффект требует проверки.", "Published records": "Публичные записи", "Scheduled returns": "Сохранённые сессии", "Follower signals": "Сигналы подписчиков", "Operator value": "Ценность для оператора", "To be validated": "Требует проверки", "Notifications": "Уведомления", "Mark all read": "Прочитать все", "Open": "Открыть", "Empty": "Пусто", "Counts are app-owned records, not GGR, CAC, retention or ROI claims.": "Это записи в приложении, а не GGR, CAC, retention или ROI.", "You followed Sofia and saved the next preview session.": "Вы подписались на Sofia и сохранили сессию (демо-пример).", "Sofia's illustrative session preview is ready. No live broadcast or operator connection is implied.": "Демо-сессия Sofia доступна. Это не трансляция и не подключение к оператору.", "SCRIPTED TABLE PREVIEW · NO WAGERS": "ФИКСИРОВАННЫЕ РАУНДЫ · БЕЗ СТАВОК", "Player hand": "Карты игрока", "Dealer hand": "Карты дилера", "Show next demo round": "Следующий демо-раунд", "Room conversation": "Общение в комнате", "Only your local demo messages appear here. There are no connected players.": "Здесь только ваши локальные сообщения. Подключённых игроков нет.", "No messages yet. Start the conversation.": "Сообщений пока нет. Попробуйте локальный чат.", "Write a message": "Напишите сообщение", "Message the demo room": "Сообщение в демо-комнату", "Send": "Отправить локально", "You": "Вы", "React to this room": "Добавить реакцию", "Reaction added": "Реакция добавлена", "PREVIEW HANDOFF": "ПОСМОТРЕТЬ ПЕРЕХОД", "CREATOR CONTEXT": "КОНТЕКСТ КРЕАТОРА", "OPERATOR CONTEXT": "КОНТЕКСТ ОПЕРАТОРА", "Follow and return context stays in LC.": "Подписка и контекст возврата остаются в LC.", "This label is not proof of integration, approval or availability.": "Это обозначение не подтверждает интеграцию, одобрение или доступность.", "LC connects the person to the Live moment.": "LC связывает человека с сессией.", "Preview handoff": "Обзор перехода", "ILLUSTRATIVE HANDOFF PREVIEW": "ДЕМОНСТРАЦИОННЫЙ ПЕРЕХОД", "Preview the licensed-operator handoff.": "Посмотрите путь к лицензированному оператору.", "Your session context stays connected": "Контекст сессии сохраняется", "LC keeps the Creator and session linked to your return journey.": "LC сохраняет связь креатора, сессии и возврата.", "The operator owns play": "Игра остаётся у оператора", "Gameplay, account, funds, KYC/AML and responsible-gaming controls remain external.": "Игра, аккаунт, деньги, KYC/AML и ответственная игра остаются у оператора.", "You can return to the person": "Можно вернуться к человеку", "Follow state, content and future Live signals remain connected to this Creator.": "Подписка, контент и будущие сигналы связаны с этим креатором.", "DESTINATION": "НАЗНАЧЕНИЕ", "Illustrative demo label only. No external destination is configured.": "Только демо-обозначение. Внешний адрес не настроен.", "SIMULATE OPERATOR RETURN": "СМОДЕЛИРОВАТЬ ВОЗВРАТ", "Demo flow only. No operator integration, license, approval or production availability is claimed.": "Только демонстрация. Интеграция, лицензия, одобрение и production-доступность не заявляются.", "Back to Live": "Вернуться к сессии", "Back to Sofia Laurent": "Вернуться к Sofia Laurent", "ACTIVITY": "СОБЫТИЯ", "People worth coming back for.": "Люди, к которым хочется вернуться.", "Live signals, reactions and reminders from your social circle.": "Уведомления, реакции и сохранённые сессии.", "NOW": "СЕЙЧАС", "Recent activity": "Последние действия", "NEXT LIVE": "СЛЕДУЮЩАЯ СЕССИЯ", "My schedule": "Моё расписание", "Private by design.": "Приватность по умолчанию.", "In-app only. No email, SMS or push delivery is implied.": "Только внутри приложения. Email, SMS и push не отправляются.", "PLAYER PROFILE": "ПРОФИЛЬ ИГРОКА", "DISCOVER": "НАЙТИ", "YOUR FEED": "ВАША ЛЕНТА", "Discovery preferences": "Предпочтения поиска", "Settings and safety": "Настройки и безопасность", "Safety center": "Центр безопасности", "Account security role": "Роль доступа аккаунта", "user": "пользователь", "UPDATE": "ОБНОВЛЕНИЕ", "NEW": "НОВЫЕ", "SAVED": "СОХРАНЕНО", "SIGNALS": "СИГНАЛЫ", "TRUST & SAFETY": "ДОВЕРИЕ И БЕЗОПАСНОСТЬ", "You control who reaches your social experience.": "Контролируйте свои социальные связи.", "Reports, blocks, notification preferences and account access remain private and isolated from business workspaces.": "Жалобы, блокировки, уведомления и доступ аккаунта изолированы от бизнес-кабинетов.", "ACCOUNT STATUS": "СТАТУС АККАУНТА", "Illustrative active state": "Демо-статус активен", "Access is enforced by the backend. A suspended or disabled account cannot continue into LC.": "В реальном продукте доступ контролирует backend. Заблокированный аккаунт не может продолжить работу.", "REPORTS": "ЖАЛОБЫ", "Private submission": "Приватное обращение", "A report does not automatically remove or penalize a Creator. Moderation visibility remains role-scoped.": "Жалоба не удаляет креатора автоматически. Модерация ограничена ролью доступа.", "BLOCKING": "БЛОКИРОВКИ", "Relationship boundary": "Граница общения", "Blocking hides discovery and prevents affected social interactions. Self and privileged targets are denied.": "Блокировка скрывает пользователя и ограничивает взаимодействия. Привилегированные действия защищены.", "BUSINESS ACCESS": "БИЗНЕС-ДОСТУП", "Separated": "Изолирован", "Operator and Provider tenants cannot read personal reports, blocks or notification settings.": "Оператор и провайдер не видят личные жалобы, блокировки и настройки уведомлений.", "YOUR CONTROLS": "ВАШИ НАСТРОЙКИ", "Privacy and signals": "Приватность и уведомления", "Live creator signals": "Уведомления креатора", "Preview only · in-app delivery": "Только демо · внутри приложения", "Blocked creators": "Заблокированные креаторы", "Sign in to manage private blocks": "Недоступно в публичном демо", "Private account settings": "Приватные настройки аккаунта", "Unavailable in the public demo. Password, privacy and deletion require the separate authenticated product.": "Недоступно в публичном демо. Пароль, приватность и удаление требуют отдельного авторизованного продукта.", "BACK TO PROFILE": "НАЗАД В ПРОФИЛЬ", "LOCAL DEMO WORKFLOW": "ЛОКАЛЬНЫЙ ДЕМО-СЦЕНАРИЙ", "Map a creator to a sample catalog": "Свяжите креатора с демо-каталогом", "Prepare a creator-led campaign": "Подготовьте кампанию креатора", "Keep creator identity and table context connected before operator delivery.": "Свяжите личность креатора с контекстом стола до передачи оператору.", "Follow discovery through handoff intent and return. Commercial outcomes remain unvalidated.": "Проследите поиск, намерение перехода и возврат. Коммерческие результаты не подтверждены.", "Sample catalog reference": "Демо-ссылка каталога", "Local campaign name": "Название локальной кампании", "Save local mapping draft": "Сохранить локальную связь", "Save local campaign draft": "Сохранить локальный черновик", "Local draft saved. No partner approval or connection is implied.": "Локальный черновик сохранён. Одобрение партнёра и подключение не заявляются.", "Preview mapped session": "Посмотреть связанную сессию", "Try the player handoff journey": "Пройти путь игрока", "THIS BROWSER SESSION ONLY": "ТОЛЬКО ЭТА СЕССИЯ БРАУЗЕРА", "Your local journey evidence": "След ваших локальных действий", "Only actions taken in this demo appear here. These records are not operator outcomes, ROI or a validated pilot.": "Здесь только действия в этом демо. Это не результаты оператора, ROI или подтверждённый пилот.", "No actions recorded yet. Save a draft and try the session preview.": "Действий пока нет. Сохраните черновик и попробуйте демо-сессию.", "OPERATOR OPERATIONS": "ЗАДАЧИ ОПЕРАТОРА", "PROVIDER OPERATIONS": "ЗАДАЧИ ПРОВАЙДЕРА", "Creator acquisition operations": "Привлечение через креаторов", "Distribution and identity readiness": "Контекст дистрибуции и личности", "Prepare creator, campaign and Live handoff context for a licensed operator environment.": "Подготовьте контекст креатора, кампании и перехода для лицензированной среды оператора.", "Prepare normalized Live-product context and creator mapping for tenant-scoped operator delivery.": "Подготовьте контекст Live-продукта и связь креатора для отдельного оператора.", "WORKSPACE ACCESS": "ДОСТУП К КАБИНЕТУ", "CREATOR SCOPE": "КРЕАТОРЫ", "SUPPLY SCOPE": "КОНТЕНТ", "Illustrative demo records": "Демонстрационные записи", "Discovery records do not imply commercial approval.": "Наличие профиля не означает коммерческого одобрения.", "Creator and Live-product context available to this workspace.": "Контекст креаторов и Live-продукта в этом кабинете.", "HANDOFF STATE": "СТАТУС ПЕРЕХОДА", "ADAPTER STATE": "СТАТУС АДАПТЕРА", "No live connection": "Нет действующего подключения", "No production operator destination is configured.": "Production-адрес оператора не настроен.", "Credentials and official API contracts are still required.": "Нужны разрешённые credentials и официальные API-контракты.", "OUTCOME": "РЕЗУЛЬТАТ", "CAC, retention, GGR and ROI require observed evidence.": "CAC, retention, GGR и ROI требуют наблюдаемых доказательств.", "No distribution or commercial impact is claimed here.": "Результат дистрибуции и коммерческий эффект не заявлены.", "NEXT ACTIONS": "СЛЕДУЮЩИЕ ШАГИ", "Handoff readiness": "Подготовка перехода", "Distribution readiness": "Подготовка дистрибуции", "Review creator readiness": "Проверьте контекст креатора", "Use only verified, published creator records.": "В реальной интеграции допустимы только проверенные публичные записи.", "Define campaign source": "Определите источник кампании", "Attach campaign context before measuring handoffs.": "Добавьте контекст кампании до измерения переходов.", "Validate handoff route": "Проверьте маршрут перехода", "Licensed operator destination and return contract are required.": "Нужен согласованный адрес оператора и контракт возврата.", "Normalize catalog context": "Нормализуйте каталог", "Define provider-neutral game and table identifiers.": "Определите идентификаторы игр и столов.", "Map creator identity": "Свяжите личность креатора", "Keep external identity mapping explicit and tenant-scoped.": "Явно задайте внешнюю связь личности в границах оператора.", "Prepare operator delivery": "Подготовьте передачу оператору", "Validate contracts before any sandbox connection.": "Проверьте контракты до подключения sandbox.", "Review required": "Нужна проверка", "Not configured": "Не настроено", "No connection": "Нет подключения", "LC RESPONSIBILITY": "ОТВЕТСТВЕННОСТЬ LC", "LICENSED INFRASTRUCTURE": "ЛИЦЕНЗИРОВАННАЯ ИНФРАСТРУКТУРА", "Discovery · creator identity · social signals · handoff intent · attributable return": "Поиск · личность креатора · социальные сигналы · намерение перехода · возврат", "Gameplay · wallet · KYC/AML · wagering · settlement · responsible gaming": "Игра · кошелёк · KYC/AML · ставки · расчёты · ответственная игра", "CREATOR ROSTER": "КАТАЛОГ КРЕАТОРОВ", "IDENTITY MAPPING": "СВЯЗИ ЛИЧНОСТИ", "Review creator eligibility before campaign or handoff configuration.": "Проверьте допуск креатора до настройки кампании и перехода.", "Review approved identity records before mapping external Live-product context.": "Проверьте личность до связывания с внешним Live-продуктом.", "Search creator": "Найти креатора", "STATUS": "СТАТУС", "All verification states": "Все статусы проверки", "Bulk actions unavailable": "Массовые действия недоступны", "Verification": "Проверка", "Publication": "Публикация", "Provider mapping": "Связь провайдера", "Campaign mapping": "Связь кампании", "Next session": "Следующая сессия", "Mapping not configured": "Связь не настроена", "No campaign mapping": "Нет связи кампании", "Creator verification and affiliation approval remain server-controlled. Demo records are illustrative and do not represent partners or approvals.": "Проверка личности и связи с компанией контролируется сервером. Демо-записи не означают партнёрства или одобрения.", "ACQUISITION PLAN": "ПЛАН ПРИВЛЕЧЕНИЯ", "DISTRIBUTION PLAN": "ПЛАН ДИСТРИБУЦИИ", "Define source, creator and licensed destination before measuring acquisition evidence.": "Задайте источник, креатора и согласованное назначение до измерения.", "Define operator, creator and catalog scope before distribution evidence begins.": "Определите оператора, креатора и каталог до проверки дистрибуции.", "No active configuration": "Нет активной настройки", "EMPTY STATE": "ПУСТОЕ СОСТОЯНИЕ", "No campaign configured": "Кампания не настроена", "No distribution plan configured": "План дистрибуции не настроен", "An approved tenant context and measurement brief are required before activation.": "До активации нужны согласованный контекст оператора и план измерения.", "LIVE OPERATIONS": "УПРАВЛЕНИЕ СЕССИЯМИ", "DISTRIBUTION MONITOR": "МОНИТОР ДИСТРИБУЦИИ", "Monitor creator-session readiness and licensed handoff mapping.": "Проверьте готовность сессии и контекст перехода к оператору.", "Inspect normalized creator-session context before operator distribution.": "Проверьте контекст креатора и сессии до передачи оператору.", "SESSION STATE": "СТАТУС СЕССИИ", "MAPPING": "СВЯЗЬ", "All states": "Все статусы", "All mapping states": "Все связи", "Export unavailable": "Экспорт недоступен", "Operator mapping": "Связь оператора", "Visibility": "Видимость", "EVIDENCE WORKSPACE": "ДОКАЗАТЕЛЬСТВА", "Separate event instrumentation, observed records and externally confirmed outcomes before making a performance claim.": "Разделяйте описание событий, наблюдаемые действия и внешне подтверждённые результаты.", "No commercial claims": "Без коммерческих утверждений", "LC EVENT INSTRUMENTATION": "СОБЫТИЯ LC", "Contract preview": "Обзор контракта", "A defined event name is not an observed result.": "Название события не означает наблюдаемый результат.", "ATTRIBUTION WINDOW": "ОКНО АТРИБУЦИИ", "A saved brief records a plan, not validated causality.": "Сохранённый план не подтверждает причинную связь.", "OPERATOR OUTCOMES": "РЕЗУЛЬТАТЫ ОПЕРАТОРА", "Not available": "Недоступно", "Gameplay, deposits, wagering and settlement remain outside LC.": "Игра, депозиты, ставки и расчёты остаются вне LC.", "COMMERCIAL VALIDATION": "КОММЕРЧЕСКАЯ ПРОВЕРКА", "CAC, retention, GGR and ROI need observed, reconciled evidence.": "CAC, retention, GGR и ROI требуют проверенных и согласованных данных.", "MEASUREMENT CONTRACT": "КОНТРАКТ ИЗМЕРЕНИЯ", "App-owned event taxonomy": "Словарь событий приложения", "No result values": "Нет значений результатов", "Event": "Событие", "Definition": "Определение", "Instrumentation": "Описание", "Evidence": "Доказательство", "Contract review": "Проверка контракта", "No count loaded": "Нет измерения", "Creator card or content enters the visible discovery surface": "Карточка креатора появилась в видимой области", "A person opens an eligible Creator profile": "Открыт профиль креатора", "A person follows an eligible Creator": "Пользователь подписался на креатора", "A person opens an eligible Creator Live session": "Открыта сессия креатора", "A person initiates navigation to a server-validated licensed-operator destination": "Пользователь инициировал согласованный переход к оператору", "A person returns to LC with attributable handoff context": "Пользователь вернулся с контекстом перехода", "CLAIM GATE": "ГРАНИЦА УТВЕРЖДЕНИЙ", "Evidence validation ladder": "Этапы проверки доказательств", "Fail closed": "Доступ закрыт по умолчанию", "LC CAN EVIDENCE": "LC МОЖЕТ НАБЛЮДАТЬ", "LC CANNOT EVIDENCE ALONE": "LC НЕ МОЖЕТ ПОДТВЕРДИТЬ САМОСТОЯТЕЛЬНО", "Discovery · profile open · follow · Live open · handoff intent · attributable return": "Поиск · профиль · подписка · сессия · намерение перехода · возврат", "Gameplay · deposits · wagering · settlement · responsible gaming · commercial impact": "Игра · депозиты · ставки · расчёты · ответственная игра · коммерческий эффект", "CONFIGURATION": "НАСТРОЙКА", "Prepare licensed handoff and event contract without moving regulated operations into LC.": "Подготовьте переход и контракт событий без переноса регулируемых операций в LC.", "Prepare provider-neutral data contracts for tenant-scoped delivery.": "Подготовьте контракты данных для отдельного оператора.", "Catalog ingestion": "Контекст каталога", "Normalized games, tables and availability contract.": "Нормализованные игры, столы и контракт доступности.", "Needs official API documentation and tenant credentials.": "Нужны официальная API-документация и разрешённый доступ оператора.", "Creator identity mapping": "Связь личности креатора", "External dealer identity to approved LC Creator record.": "Связь внешней личности с проверенной записью креатора LC.", "Must fail closed when an identity cannot be verified.": "Без проверки личности доступ должен оставаться закрытым.", "Operator distribution": "Передача оператору", "Tenant-scoped destinations and market availability.": "Назначения и доступность рынка в границах оператора.", "No operator integration or approval is implied.": "Интеграция и одобрение оператора не заявлены.", "Signed events": "Подписанные события", "Webhook signature, idempotency and replay controls.": "Подпись webhook, идемпотентность и защита от повторов.", "Server-side implementation required.": "Нужна серверная реализация.", "Licensed destination": "Согласованное назначение", "Allowlisted, server-generated handoff destination.": "Разрешённый адрес перехода, формируемый сервером.", "Jurisdiction and operator controls remain external.": "Юрисдикция и контроль оператора остаются внешними.", "Return attribution": "Атрибуция возврата", "Contract only": "Только контракт", "App-owned intent and attributable return event contract.": "Контракт намерения перехода и атрибутируемого возврата.", "No gameplay or transaction data is collected by LC.": "LC не собирает игровые и транзакционные данные.", "Campaign source": "Источник кампании", "Tenant, creator and campaign source context.": "Контекст оператора, креатора и источника кампании.", "Required before an evidence window can start.": "Нужен до начала окна измерения.", "Event delivery": "Передача событий", "Signed, tenant-scoped server event exchange.": "Подписанный серверный обмен в границах оператора.", "Credentials and external API documentation required.": "Нужны разрешённый доступ и внешняя API-документация.", "Safety & policy": "Безопасность и правила", "Reports": "Жалобы", "No queue access": "Нет доступа к очереди", "Account status": "Статус аккаунта", "Server-enforced denial": "Контроль сервера", "Creator controls": "Управление креаторами", "No client approval": "Нет одобрения из клиента", "Audit": "Аудит", "Restricted": "Ограничено", "WORKSPACE": "КАБИНЕТ", "Organization, environment and partnership access state.": "Компания, среда и статус запроса доступа.", "ORGANIZATION": "КОМПАНИЯ", "ENVIRONMENT": "СРЕДА", "ACCESS": "ДОСТУП", "Demonstration": "Демонстрация", "Demo label only; no real organization, partner or approval is represented.": "Только демо-обозначение, без реальной компании, партнёра или одобрения.", "No production integration or readiness is implied.": "Production-интеграция и готовность не заявлены.", "A submission cannot self-approve access or configure an integration.": "Запрос не может сам предоставить доступ или настроить интеграцию.", "REQUEST PARTNERSHIP ACCESS": "ОБСУДИТЬ ДОСТУП", "Role unavailable": "Роль недоступна", "This role is not part of the public demo.": "Этой роли нет в публичном демо.", "Back to Discover": "Вернуться к поиску", "Already saved.": "Уже сохранено.", "This action is not available.": "Действие недоступно.", "Connection issue. Try again.": "Проблема соединения. Попробуйте снова.", "Something went wrong. Please try again.": "Не удалось выполнить действие. Попробуйте снова.", "Demo action saved": "Локальное действие сохранено", "Local demo": "Локальное демо", "English": "Английский", "French": "Французский", "Italian": "Итальянский", "Spanish": "Испанский", "Armenian": "Армянский", "Malta": "Мальта", "Latvia": "Латвия", "France": "Франция", "Armenia": "Армения", "UK": "Великобритания", "player": "игрок", "creator": "креатор", "operator": "оператор", "provider": "провайдер", "Discover": "Найти", "Return": "Вернуться", "LC core loop": "Социальный путь LC", "Creators in demo live sessions": "Креаторы в демо-сессиях", "Creator feed": "Лента креаторов", "Open creator profile": "Открыть профиль креатора", "Like post": "Нравится", "Add a comment…": "Добавьте комментарий…", "Post comment": "Отправить комментарий", "LC App social experience": "Социальный продукт LC App", "LC App business back office": "Бизнес-кабинет LC App", "Business back office": "Бизнес-кабинет", "Social app": "Социальное приложение", "SAMPLE SCHEDULE": "ДЕМО-РАСПИСАНИЕ", "Local preview only. No creator verification, publication or operator connection is implied.": "Только локальный обзор. Проверка креатора, реальная публикация и подключение оператора не заявлены.", "Illustrative preview mode": "Демонстрационный режим", "Campaign draft saved": "Черновик кампании сохранён", "Mapping draft saved": "Черновик связи сохранён", "♡ Like post": "♡ Нравится", "♥ Liked": "♥ Нравится", "Comment on this update": "Комментарий к обновлению", "You:": "Вы:", "demo_campaign_draft_saved": "Черновик кампании сохранён", "demo_mapping_draft_saved": "Черновик связи сохранён", "creator_follow": "Подписка на креатора", "creator_unfollow": "Отмена подписки", "creator_profile_open": "Открытие профиля", "live_open": "Открытие сессии", "handoff_intent": "Намерение перехода", "handoff_return": "Возврат из сценария оператора", "ILLUSTRATIVE PROFILE": "ДЕМО-ПРОФИЛЬ", "Updates": "Обновления", "Games": "Игры", "Creator profile activity": "Записи профиля креатора", "Creator safety actions": "Действия безопасности", "Keep your experience safe": "Управляйте безопасностью", "Report": "Пожаловаться", "Block": "Заблокировать", "operator context is not an LC approval": "контекст оператора не означает одобрения LC", "LC connects you to people, not funds.": "LC связывает вас с людьми, а не с деньгами.", "Gameplay and all regulated casino operations stay with the licensed operator.": "Игра и регулируемые операции остаются у лицензированного оператора.", "Discovery stays inside LC. Gameplay does not.": "Поиск остаётся в LC. Игра — у оператора.", "Any Play action continues through an eligible licensed operator destination; LC does not handle funds, KYC or wagering.": "Переход к игре возможен только в допустимую среду лицензированного оператора. LC не управляет деньгами, KYC или ставками.", "local_campaign_draft": "Локальный черновик кампании", "local_mapping_draft": "Локальная связь с каталогом", "Sofia discovery preview": "Знакомство с Sofia (демо)", "Administrative actions require an authorized backend role and attributable record.": "Административные действия требуют разрешённой роли сервера и атрибутируемой записи.", "Any outcome claim requires licensed operator confirmation.": "Заявление о результатах требует подтверждения лицензированного оператора.", "Attribution window (1–30 days)": "Окно атрибуции (1–30 дней)", "Build retention before a player enters.": "Создайте повод вернуться до перехода игрока.", "Creator impression": "Показ креатора", "Customer-confirmed": "Подтверждено заказчиком", "Define what a first pilot should learn before discussing commercial outcomes.": "Определите, что должен проверить первый пилот, прежде чем обсуждать коммерческие результаты.", "Enter the table": "Открыть демо-комнату", "Event availability is evaluated inside the authorized account and tenant scope. Contract presence never implies volume, performance or partner validation.": "События оцениваются в разрешённых границах аккаунта и оператора. Наличие контракта не означает объём событий, результат или проверку партнёра.", "Event records must be collected in the authorized tenant scope.": "События должны собираться в разрешённых границах оператора.", "Follow dealers": "Подписывайтесь на дилеров", "Followers can save an eligible public session and return for you at the right time.": "Подписчики могут сохранить допустимую публичную сессию и вернуться к нужному времени.", "Gameplay, account and access open in focused popups.": "Игровой обзор, профиль и доступ открываются отдельно.", "Gameplay, wallet, KYC/AML, wagering, settlement and responsible-gaming operations remain with licensed operator/provider infrastructure.": "Игра, кошелёк, KYC/AML, ставки, расчёты и ответственная игра остаются в лицензированной инфраструктуре оператора и провайдера.", "HANDOFF": "ПЕРЕХОД", "Handoff": "Переход", "Handoff and return context must pass data-quality checks.": "Контекст перехода и возврата должен пройти проверку качества данных.", "Handoff intent": "Намерение перехода", "Instrumented": "Контракт событий", "LC manages discovery, creator relationships, configuration and observed attribution. Gameplay, funds, KYC/AML and settlement stay with licensed operator/provider infrastructure.": "LC управляет поиском, связью с креаторами, настройками и наблюдаемой атрибуцией. Игра, деньги, KYC/AML и расчёты остаются у лицензированного оператора и провайдера.", "LIVE": "ДЕМО-ЭФИР", "Live casino starts before the table": "Live Casino начинается со знакомства", "Live open": "Открытие сессии", "Lobby → Game → Table → Seat": "Лобби → Игра → Стол → Место", "Local preview only. Creator verification and affiliation approval are not claimed.": "Только локальный обзор. Проверка креатора и подтверждение принадлежности не заявлены.", "Named, first-party event contract exists in LC.": "В LC описан собственный контракт события.", "No distribution or commercial impact is claimed.": "Результат дистрибуции и коммерческий эффект не заявлены.", "Not evidenced": "Нет доказательств", "OLD": "ПРЕЖНИЙ ПУТЬ", "Observed": "Наблюдаемо", "Observed LC events": "Наблюдаемые события LC", "Open the feed, watch the moment, follow the dealer and move into table play only when the player chooses.": "Откройте ленту, познакомьтесь с дилером и подпишитесь. Демо-комната открывается только по выбору игрока.", "Operator or studio": "Оператор или студия", "PROVIDER-NATIVE": "ВНУТРИ ПРОВАЙДЕРА", "Person → Follow → Live → Play → Return": "Человек → Подписка → Сессия → Игра → Возврат", "Pilot measurement brief": "План измерения пилота", "Post text": "Текст поста", "Prepare a licensed handoff and event contract without moving regulated operations into LC.": "Подготовьте контракт перехода и событий, сохраняя регулируемые операции за пределами LC.", "Prepare normalized Live-product context and creator mappings for tenant-scoped operator delivery.": "Подготовьте контекст Live-продукта и связи креаторов для передачи в границах оператора.", "Preview Live Casino rooms": "Посмотрите демо-комнаты Live Casino", "Profile open": "Открытие профиля", "Public profile": "Публичный профиль", "Publication and affiliation verification cannot be escalated here.": "Публикация и подтверждение принадлежности не могут получить привилегии из этого кабинета.", "Readiness is self-reported and unverified. LC stores app-owned funnel events only; gameplay, wallet, KYC/AML, wagering and settlement remain outside LC.": "Готовность указана пользователем и не проверена. LC хранит только собственные события пути; игра, кошелёк, KYC/AML, ставки и расчёты остаются вне LC.", "Reconciled": "Сверено", "Report ownership and visibility remain isolated by backend policy.": "Владение жалобой и видимость защищены правилами сервера.", "Request status remains pending until reviewed by an authorized backend process.": "Запрос ожидает проверки разрешённым серверным процессом.", "Return visit": "Повторный визит", "Review illustrative dealer-led game moments.": "Изучите демонстрационные сессии дилеров.", "SAVE DRAFT": "СОХРАНИТЬ ЧЕРНОВИК", "SOCIAL STREAMING": "СОЦИАЛЬНЫЕ ТРАНСЛЯЦИИ", "SUBMIT FOR REVIEW": "ОТПРАВИТЬ НА ПРОВЕРКУ", "Schedule reminder": "Сохранение сессии", "Session records describe LC social state only. They do not prove operator availability, gameplay activity or commercial performance.": "Сессии описывают только социальный сценарий LC. Они не доказывают доступность оператора, игровую активность или коммерческий результат.", "Signal response": "Отклик на сигнал", "Skip": "Пропустить", "Start demo": "Открыть демо", "Status": "Статус", "Suspended accounts cannot continue through this client.": "Заблокированные аккаунты не могут продолжить работу через этот клиент.", "Unavailable": "Недоступно", "Verification remains server-controlled.": "Проверка остаётся под контролем сервера.", "View policy posture for this tenant; moderation records remain private and role-scoped.": "Посмотрите правила доступа компании; записи модерации остаются приватными и ограниченными ролью.", "creator_impression": "Показ креатора", "live_session_open": "Открытие демо-сессии", "optional · user claimed": "необязательно · без проверки", "ILLUSTRATIVE IDENTITY": "ДЕМО-ЛИЧНОСТЬ", "Illustrative identity": "Демо-личность", "not verified": "не проверена", "not requested": "не запрошено", "0 verified Live · demo records are previews": "Нет подтверждённых эфиров · только демо-сессии", "♡ React to this room": "♡ Реакция в комнате", "The licensed operator remains responsible for gameplay, wallet, KYC/AML, wagering, settlement and responsible-gaming operations.": "Игра, кошелёк, KYC/AML, ставки, расчёты и ответственная игра остаются ответственностью лицензированного оператора.", "Creator viewed": "Просмотр креатора", "Profile opened": "Открытие профиля", "Creator followed": "Подписка на креатора", "Session opened": "Открытие сессии", "Reminder saved": "Сессия сохранена", "Handoff preview opened": "Открытие сценария перехода", "Returned to LC": "Возврат в LC", "Local campaign draft saved": "Локальный черновик кампании сохранён", "Local catalog mapping saved": "Локальная связь с каталогом сохранена", "Product reconnected": "Соединение восстановлено", "Demo reaction updated": "Локальная реакция обновлена", "Reaction saved": "Реакция сохранена", "Demo comment saved": "Локальный комментарий сохранён", "Comment saved": "Комментарий сохранён", "Demo request saved": "Демо-запрос сохранён локально", "Request submitted": "Запрос отправлен", "Demo report saved locally": "Демо-жалоба сохранена локально", "Report submitted privately": "Жалоба отправлена приватно", "Creator blocked": "Креатор скрыт", "Creator unblocked": "Креатор снова виден", "Demo reset": "Демо сброшено", "Creator verification and a published profile are required.": "Нужны проверка креатора и публичный профиль.", "Publish this session before going live.": "Сначала опубликуйте сессию.", "End the current Live session before starting another.": "Завершите текущую сессию перед следующей."};
  let locale;
  try { locale = new URLSearchParams(window.location.search).get("lang") || localStorage.getItem("lc-lang") || "en"; } catch { locale = "en"; }
  if (!["en", "ru"].includes(locale)) locale = "en";
  document.documentElement.lang = locale;
  const original = new WeakMap();
  const translate = value => {
    const key = String(value).trim();
    if (locale !== "ru") return key;
    if (ru[key]) return ru[key];
    if (/^← Back to /.test(key)) return "← Назад к " + key.slice(10);
    if (/^Open upcoming session with /.test(key)) return "Открыть демо-сессию с " + key.slice(27);
    if (/^Open .+'s profile$/.test(key)) return "Открыть профиль " + key.slice(5,-10);
    if (/^Comment on .+'s post$/.test(key)) return "Комментарий к посту " + key.slice(11,-7);
    if (/ at a Live Casino table$/.test(key)) return key.replace(/ at a Live Casino table$/, " за столом Live Casino");
    if (key.includes(" · ")) return key.split(" · ").map(part=>translate(part)).join(" · ");
    if (/^Switch role · /.test(key)) return "Выбрать роль · " + (ru[key.split(" · ")[1]] || key.split(" · ")[1]);
    if (/^Blackjack with /.test(key)) return "Blackjack с " + key.slice(15);
    if (/^Example round /.test(key)) return key.replace(/^Example round (\d+) of (\d+)\. Fixed cards demonstrate the room presentation, not a playable casino engine or broadcast\./, "Демо-раунд $1 из $2. Фиксированные карты показывают интерфейс комнаты, а не игровой движок или трансляцию.");
    if (/^\d+ verified Live · demo records are previews$/.test(key)) return "Нет подтверждённых эфиров · только демо-сессии";
    if (/^\d+ (new signals?|unread|total|new|saved|likes?|comments?)$/.test(key)) return key.replace(/new signals?|unread|total|new|saved|likes?|comments?/g, x=>({"new signal":"новый сигнал","new signals":"новых сигналов",unread:"непрочитанных",total:"всего",new:"новых",saved:"сохранено",like:"реакция",likes:"реакций",comment:"комментарий",comments:"комментариев"})[x]);
    return key;
  };
  window.LCDemoLocale = { translate, get: () => locale };
  let scheduled = false;
  const localize = () => {
    scheduled = false;
    const root = document.getElementById("lcProductShell");
    if (!root) return;
    for (const node of [root, ...root.querySelectorAll("*")]) {
      if (node.closest("[data-lc-user-content]")) continue;
      for (const attribute of ["aria-label", "placeholder", "title", "alt"]) {
        const value = node.getAttribute(attribute);
        if (value && translate(value) !== value) node.setAttribute(attribute, translate(value));
      }
      for (const text of node.childNodes) {
        if (text.nodeType !== 3 || !text.textContent.trim()) continue;
        if (!original.has(text)) original.set(text, text.textContent);
        const value = translate(original.get(text));
        if (locale === "ru" && text.textContent.trim() !== value) text.textContent = value;
      }
    }
    root.querySelectorAll('.lc-product-demo-banner a[href*="#contact"]').forEach(link => {
      link.setAttribute("href", `../?lang=${locale}#contact`);
    });
    root.querySelectorAll(".lc-v4-table").forEach(table => {
      const headers = [...table.querySelectorAll("thead th")].map(th=>th.textContent);
      table.querySelectorAll("tbody tr").forEach(row=>[...row.children].forEach((td,i)=>td.dataset.label=headers[i] || ""));
    });
  };
  const schedule = () => { if (!scheduled) { scheduled = true; queueMicrotask(localize); } };
  if (typeof MutationObserver !== "undefined") new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();


  }

  const CSS_ID = "lcProductV2Css";
  const V4_CSS_ID = "lcProductV4Css";
  const SOCIAL_FEED_CSS_ID = "lcSocialFeedV4Css";
  const CREATOR_STUDIO_CSS_ID = "lcCreatorStudioV4Css";
  const SOCIAL_ACCOUNT_CSS_ID = "lcSocialAccountV4Css";
  const SOCIAL_JOURNEY_CSS_ID = "lcSocialJourneyV4Css";
  const BUSINESS_CONSOLE_CSS_ID = "lcBusinessConsoleV4Css";
  const RAIL_ID = "lcProductV2Rail";
  const LOAD_ID = "lcProductV2Loading";
  const ROUTE_STATUS_ID = "lcProductRouteStatus";
  const PRODUCT_SELECTOR = "#lcProductShell";

  const SOCIAL_NAV = [
    ["home", "⌂", "Home"],
    ["explore", "◎", "Explore"],
    ["create", "+", "Create"],
    ["activity", "♡", "Activity"],
    ["profile", "◉", "Profile"]
  ];

  const BUSINESS_NAV = [
    ["overview", "▦", "Overview"],
    ["creators", "◎", "Creators"],
    ["campaigns", "◈", "Campaigns"],
    ["live", "●", "Live"],
    ["performance", "↗", "Performance"],
    ["integrations", "◇", "Integrations"],
    ["safety", "◉", "Safety"],
    ["settings", "⚙", "Settings"]
  ];

  function ensureCss() {
    if (window.LC_APP_MODE === "public_demo" && document.getElementById("lcPublicProductCss")) return;
    let link = document.getElementById(CSS_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = CSS_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (!/product-shell-v2\.css\?v=5$/.test(link.href)) link.href = "product-shell-v2.css?v=5";

    let v4 = document.getElementById(V4_CSS_ID);
    if (!v4) {
      v4 = document.createElement("link");
      v4.id = V4_CSS_ID;
      v4.rel = "stylesheet";
      document.head.appendChild(v4);
    }
    if (!/product-shell-v4\.css\?v=4$/.test(v4.href)) v4.href = "product-shell-v4.css?v=4";

    let socialFeed = document.getElementById(SOCIAL_FEED_CSS_ID);
    if (!socialFeed) {
      socialFeed = document.createElement("link");
      socialFeed.id = SOCIAL_FEED_CSS_ID;
      socialFeed.rel = "stylesheet";
      document.head.appendChild(socialFeed);
    }
    if (!/social-feed-v4\.css\?v=1$/.test(socialFeed.href)) socialFeed.href = "social-feed-v4.css?v=1";

    let creatorStudio = document.getElementById(CREATOR_STUDIO_CSS_ID);
    if (!creatorStudio) {
      creatorStudio = document.createElement("link");
      creatorStudio.id = CREATOR_STUDIO_CSS_ID;
      creatorStudio.rel = "stylesheet";
      document.head.appendChild(creatorStudio);
    }
    if (!/creator-studio-v4\.css\?v=1$/.test(creatorStudio.href)) creatorStudio.href = "creator-studio-v4.css?v=1";

    let socialAccount = document.getElementById(SOCIAL_ACCOUNT_CSS_ID);
    if (!socialAccount) {
      socialAccount = document.createElement("link");
      socialAccount.id = SOCIAL_ACCOUNT_CSS_ID;
      socialAccount.rel = "stylesheet";
      document.head.appendChild(socialAccount);
    }
    if (!/social-account-v4\.css\?v=2$/.test(socialAccount.href)) socialAccount.href = "social-account-v4.css?v=2";

    let socialJourney = document.getElementById(SOCIAL_JOURNEY_CSS_ID);
    if (!socialJourney) {
      socialJourney = document.createElement("link");
      socialJourney.id = SOCIAL_JOURNEY_CSS_ID;
      socialJourney.rel = "stylesheet";
      document.head.appendChild(socialJourney);
    }
    if (!/social-journey-v4\.css\?v=1$/.test(socialJourney.href)) socialJourney.href = "social-journey-v4.css?v=1";

    let businessConsole = document.getElementById(BUSINESS_CONSOLE_CSS_ID);
    if (!businessConsole) {
      businessConsole = document.createElement("link");
      businessConsole.id = BUSINESS_CONSOLE_CSS_ID;
      businessConsole.rel = "stylesheet";
      document.head.appendChild(businessConsole);
    }
    if (!/business-console-v4\.css\?v=2$/.test(businessConsole.href)) businessConsole.href = "business-console-v4.css?v=2";
  }

  const productRoot = () => document.querySelector(PRODUCT_SELECTOR);
  const isProductRoute = () => /^#\/product(?:\/|$)/.test(window.location.hash || "#/product");

  function currentRoute() {
    const parts = String(window.location.hash || "#/product").replace(/^#\/?/, "").split("?")[0].split("/").filter(Boolean);
    return parts[0] === "product" ? parts.slice(1) : [];
  }

  function currentPersonaLabel() {
    const root = productRoot();
    const routePersona = currentRoute()[0] === "demo" ? currentRoute()[1] : "";
    if (["player", "creator", "operator", "provider", "admin"].includes(routePersona)) {
      return routePersona.charAt(0).toUpperCase() + routePersona.slice(1);
    }
    const chip = root?.querySelector(".lc-product-top [data-lc-product='profile'],.lc-product-top [data-lc-product='account']");
    const raw = String(chip?.textContent || "").trim().toLowerCase();
    if (["industry", "operator"].includes(raw)) return "Operator";
    if (raw === "provider") return "Provider";
    if (raw === "admin") return "Admin";
    if (raw === "creator") return "Creator";
    if (raw === "player") return "Player";
    if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1);
    const explicit = String(root?.dataset?.lcPersona || "").trim().toLowerCase();
    if (["player", "creator", "operator", "provider", "admin", "industry"].includes(explicit)) {
      return explicit === "industry" ? "Operator" : explicit.charAt(0).toUpperCase() + explicit.slice(1);
    }
    return "Player";
  }

  function productFamily() {
    const persona = currentPersonaLabel().toLowerCase();
    return ["operator", "provider", "admin", "industry"].includes(persona) ? "business" : "social";
  }

  function activeNav() {
    const root = productRoot();
    if (productFamily() === "business" && root?.dataset?.lcBusinessView) return root.dataset.lcBusinessView;
    if (productFamily() === "social" && root?.dataset?.lcSocialView) return root.dataset.lcSocialView;
    const route = currentRoute();
    const title = productRoot()?.querySelector(".lc-product-brand strong")?.textContent?.toLowerCase() || "";
    if (/account|profile|settings|safety|privacy/.test(title)) return "account";
    if (/notification|activity|signal/.test(title)) return "activity";
    if (["creator", "live", "handoff"].includes(route[0]) && productFamily() === "social") return "discover";
    if (/creator home|create|session|content/.test(title) && currentPersonaLabel() === "Creator") return "creator";
    if (/discover|explore|creator/.test(title)) return "discover";
    return "home";
  }

  function syncRouteState(root) {
    const route = currentRoute();
    const persona = currentPersonaLabel().toLowerCase();
    const family = productFamily();
    const routeKey = route.length ? route.join("-") : "home";
    root.dataset.lcRoute = routeKey;
    root.dataset.lcPersona = persona;
    root.dataset.lcFamily = family;
    document.documentElement.dataset.lcRoute = routeKey;
    document.documentElement.dataset.lcPersona = persona;
    document.documentElement.dataset.lcFamily = family;
    document.documentElement.classList.toggle("lc-v4-social", family === "social");
    document.documentElement.classList.toggle("lc-v4-business", family === "business");
  }

  function buildNavButton([id, icon, label], family = "social") {
    const button = document.createElement("button");
    button.type = "button";
    if (family === "business") button.dataset.lcBusinessView = id;
    else button.dataset.lcProduct = id;
    button.innerHTML = `<span class="lc-v2-rail-icon" aria-hidden="true">${icon}</span><span>${label}</span>`;
    return button;
  }

  function syncRail() {
    const root = productRoot();
    if (!root || !isProductRoute()) return;
    const family = productFamily();
    root.dataset.lcV2Layout = family === "business" ? "workspace" : "social";

    let rail = document.getElementById(RAIL_ID);
    if (family === "social") {
      rail?.remove();
      return;
    }

    if (!rail) {
      rail = document.createElement("aside");
      rail.id = RAIL_ID;
      rail.className = "lc-v2-rail lc-v4-business-rail";
      rail.setAttribute("aria-label", "LC App business navigation");
      rail.innerHTML = `
        <div class="lc-v2-rail-brand">
          <span class="lc-v2-mark" aria-hidden="true">LC</span>
          <div><strong>LC Business</strong><span>Operator & provider back office</span></div>
        </div>
        <nav class="lc-v2-rail-nav" aria-label="Business workspace"></nav>
        <div class="lc-v2-rail-foot">
          <div class="lc-v2-network" data-lc-v2-network>Online</div>
          <div class="lc-v2-boundary">LC manages discovery, creator relationships, configuration and observed attribution. Gameplay, funds, KYC/AML and settlement stay with licensed operator/provider infrastructure.</div>
        </div>`;
      root.prepend(rail);
    }

    const nav = rail.querySelector(".lc-v2-rail-nav");
    if (nav) {
      const expectedIds = BUSINESS_NAV.map(([id]) => id);
      const currentButtons = Array.from(nav.querySelectorAll(":scope > button[data-lc-business-view]"));
      const currentIds = currentButtons.map((button) => button.dataset.lcBusinessView);
      const structureMatches = currentIds.length === expectedIds.length
        && currentIds.every((id, index) => id === expectedIds[index]);
      if (!structureMatches) {
        nav.replaceChildren(...BUSINESS_NAV.map((item) => buildNavButton(item, "business")));
      }
      nav.querySelectorAll("[data-lc-business-view]").forEach((button) => {
        button.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          void window.LCAppProduct?.navigate?.(button.dataset.lcBusinessView);
        };
        const active = button.dataset.lcBusinessView === activeNav();
        button.classList.toggle("active", active);
        if (active) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
    }

    let mobile = rail.querySelector(".lc-business-mobile");
    if (!mobile) {
      mobile = document.createElement("label"); mobile.className = "lc-business-mobile";
      const caption = document.createElement("span"); caption.textContent = "Business section";
      const select = document.createElement("select"); select.setAttribute("aria-label", "Business section");
      for (const [id, , label] of BUSINESS_NAV) { const option = document.createElement("option"); option.value = id; option.textContent = label; select.append(option); }
      select.addEventListener("change", () => window.LCAppProduct?.navigate?.(select.value));
      mobile.append(caption, select); rail.prepend(mobile);
    }
    mobile.querySelector("select").value = activeNav();
    const network = rail.querySelector("[data-lc-v2-network]");
    if (network) {
      const label = root?.dataset?.lcInvestor === "true" ? `${currentPersonaLabel()} · Local demo` : navigator.onLine ? `${currentPersonaLabel()} · Online` : `${currentPersonaLabel()} · Offline`;
      const localized = window.LCDemoLocale?.translate(label) || label;
      if (network.textContent !== localized) network.textContent = localized;
      network.classList.toggle("offline", !navigator.onLine);
    }
  }

  function syncSocialTabs(root) {
    if (productFamily() !== "social") return;
    const tabs = root.querySelector(".lc-product-tabs");
    if (!tabs) return;
    const active = activeNav();
    const expectedIds = SOCIAL_NAV.map(([id]) => id);
    let buttons = Array.from(tabs.querySelectorAll(":scope > button[data-lc-product]"));
    const currentIds = buttons.map((button) => button.dataset.lcProduct);
    const structureMatches = currentIds.length === expectedIds.length
      && currentIds.every((id, index) => id === expectedIds[index]);
    if (!structureMatches) {
      tabs.replaceChildren(...SOCIAL_NAV.map((item) => buildNavButton(item, "social")));
      buttons = Array.from(tabs.querySelectorAll(":scope > button[data-lc-product]"));
    }

    buttons.forEach((button) => {
      const id = button.dataset.lcProduct;
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        void window.LCAppProduct?.navigate?.(id);
      };
      button.classList.toggle("active", active === id);
      if (active === id) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    tabs.setAttribute("role", "navigation");
    tabs.setAttribute("aria-label", "Social app navigation");
  }

  function syncDemoSwitch(root) {
    root.querySelectorAll("[data-lc-demo-switch]").forEach((button) => {
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (window.location.hash !== "#/product") window.location.hash = "#/product";
        else window.LCAppProduct?.mountDemoEntry?.();
      };
    });
  }

  function handleDemoSwitch(event) {
    const button = event.target.closest?.("[data-lc-demo-switch]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (window.location.hash !== "#/product") {
      window.location.hash = "#/product";
      window.location.reload();
    } else {
      window.LCAppProduct?.mountDemoEntry?.();
    }
  }

  function primeDemoPersonaRoute(event) {
    const button = event.target.closest?.("[data-lc-demo-persona]");
    if (!button) return;
    const persona = button.dataset.lcDemoPersona;
    if (!["player", "creator", "operator", "provider", "admin"].includes(persona)) return;
    const next = `#/product/demo/${persona}`;
    if (window.location.hash !== next) window.location.hash = next;
  }

  function ensureLoadingBar() {
    if (document.getElementById(LOAD_ID)) return;
    const bar = document.createElement("div");
    bar.id = LOAD_ID;
    bar.className = "lc-v2-loading-bar";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
  }

  function ensureRouteStatus() {
    if (document.getElementById(ROUTE_STATUS_ID)) return;
    const status = document.createElement("div");
    status.id = ROUTE_STATUS_ID;
    status.className = "sr-only";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    document.body.appendChild(status);
  }

  let lastRouteAnnouncement = "";
  let lastFocusedRoute = window.location.hash;
  function announceRoute(root) {
    const heading = (root.querySelector("h1") || root.querySelector("h2"))?.textContent?.trim();
    const label = heading || root.querySelector(".lc-product-brand strong")?.textContent?.trim() || "LC App";
    const routeFamily = productFamily() === "business" ? "Business back office" : "Social app";
    const announcement = `${window.LCDemoLocale?.translate(routeFamily) || routeFamily}: ${window.LCDemoLocale?.translate(label) || label}`;
    if (root.dataset.lcInvestor === "true" && lastFocusedRoute !== window.location.hash) {
      lastFocusedRoute = window.location.hash;
      window.requestAnimationFrame(() => {
        const destination = root.querySelector("h1") || root.querySelector("h2") || root;
        destination.setAttribute("tabindex", "-1");
        destination.focus({ preventScroll: true });
      });
    }
    if (announcement === lastRouteAnnouncement) return;
    lastRouteAnnouncement = announcement;
    const status = document.getElementById(ROUTE_STATUS_ID);
    if (status) status.textContent = announcement;
  }

  function improveSemantics(root) {
    root.setAttribute("role", window.LC_APP_MODE === "public_demo" ? "region" : "main");
    const accessibleName = productFamily() === "business" ? "LC App business back office" : "LC App social experience";
    root.setAttribute("aria-label", window.LCDemoLocale?.translate(accessibleName) || accessibleName);

    root.querySelectorAll("img").forEach((img) => {
      const critical = Boolean(img.closest(".lc-v4-creator-hero,.lc-v4-live-stage,.lc-v4-handoff-hero"));
      if (!img.hasAttribute("loading")) img.loading = critical ? "eager" : "lazy";
      if (critical) img.fetchPriority = "high";
      if (!img.hasAttribute("decoding")) img.decoding = "async";
      if (!img.hasAttribute("alt")) {
        const card = img.closest(".lc-product-row,.lc-product-cinema,.lc-product-media-tile,.lc-v3-live-card,.lc-v3-creator-row");
        const name = card?.querySelector("h1,h2,h3,b,strong")?.textContent?.trim();
        img.alt = name ? `${name} visual` : "LC App creator visual";
      }
    });

    root.querySelectorAll("button").forEach((button) => {
      if (!button.getAttribute("aria-label") && !String(button.textContent || "").trim()) button.setAttribute("aria-label", "LC App action");
      if (root.dataset.lcInvestor === "true" && button.hasAttribute("data-lc-home-filter")) button.setAttribute("aria-pressed", String(button.classList.contains("active")));
      if (root.dataset.lcInvestor === "true" && button.hasAttribute("data-lc-follow")) button.setAttribute("aria-pressed", String(/^following$/i.test(button.textContent.trim())));
      if (button.disabled) button.setAttribute("aria-disabled", "true");
      else button.removeAttribute("aria-disabled");
    });

    const labelledFieldIds = new Set(Array.from(root.querySelectorAll("label[for]"), label => label.htmlFor).filter(Boolean));
    root.querySelectorAll("input,select,textarea").forEach((field) => {
      if (!field.getAttribute("autocomplete") && field.tagName === "INPUT") field.setAttribute("autocomplete", "off");
      if (field.getAttribute("aria-label") || (field.id && labelledFieldIds.has(field.id))) return;
      const placeholder = field.getAttribute("placeholder");
      const name = field.getAttribute("name");
      if (placeholder || name) field.setAttribute("aria-label", placeholder || name.replace(/[_-]+/g, " "));
    });

    root.querySelectorAll(".lc-product-demo-banner").forEach((banner) => {
      banner.setAttribute("role", "status");
      banner.setAttribute("aria-label", "Illustrative preview mode");
    });
    root.querySelectorAll(".lc-product-connectivity").forEach((banner) => {
      banner.setAttribute("role", "status");
      banner.setAttribute("aria-live", "polite");
    });
    root.querySelectorAll(".lc-product-empty").forEach((empty) => {
      if (!empty.getAttribute("role")) empty.setAttribute("role", "status");
    });
  }

  function syncBusyState(root) {
    const busy = root.getAttribute("aria-busy") === "true" || Boolean(root.querySelector("[aria-busy='true'],[data-lc-busy='true']"));
    document.documentElement.classList.toggle("lc-v2-busy", busy);
  }

  function syncScrollState() {
    const root = productRoot();
    if (!root) return;
    root.dataset.lcScrolled = root.scrollTop > 10 ? "true" : "false";
  }

  function upgrade() {
    ensureCss();
    ensureLoadingBar();
    ensureRouteStatus();
    document.documentElement.classList.toggle("lc-product-v2", isProductRoute());
    const root = productRoot();
    if (!root || !isProductRoute()) {
      const status = document.getElementById(ROUTE_STATUS_ID);
      if (status) status.textContent = "";
      lastRouteAnnouncement = "";
      return;
    }
    syncRouteState(root);
    syncRail();
    syncSocialTabs(root);
    syncDemoSwitch(root);
    improveSemantics(root);
    syncBusyState(root);
    syncScrollState();
    announceRoute(root);
  }

  let raf = 0;
  const scheduleUpgrade = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      upgrade();
      observer.takeRecords();
    });
  };

  const observer = new MutationObserver(scheduleUpgrade);
  observer.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:["class","hidden","disabled","aria-hidden"] });

  window.addEventListener("click", handleDemoSwitch, true);
  window.addEventListener("click", primeDemoPersonaRoute, true);
  document.addEventListener("scroll", (event) => {
    if (event.target === productRoot()) requestAnimationFrame(syncScrollState);
  }, true);
  window.addEventListener("hashchange", () => {
    const root = productRoot();
    if (root) root.scrollTo({ top:0, behavior:"auto" });
    scheduleUpgrade();
  });
  window.addEventListener("online", scheduleUpgrade);
  window.addEventListener("offline", scheduleUpgrade);
  window.addEventListener("pageshow", scheduleUpgrade);
  window.addEventListener("resize", scheduleUpgrade, { passive:true });
  document.addEventListener("DOMContentLoaded", scheduleUpgrade, { once:true });
  scheduleUpgrade();
})();
