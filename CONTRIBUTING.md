# Contributing / Разработка

## Быстрый старт

См. [README.md](README.md) для локального запуска и [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)
для полного технического статуса проекта.

## Соглашения

- **Ветки**: `feature/<короткое-имя>`, `fix/<короткое-имя>`, `chore/<короткое-имя>`.
- **Коммиты**: желательно в духе [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`) — упрощает чтение истории и генерацию changelog.
- **Backend**: модуль = `module/*.controller.ts` + `*.service.ts` + `*.module.ts` (+ `dto/` при необходимости),
  по образцу уже готовых модулей `products`, `cart`, `orders`.
- **Frontend**: страницы — App Router (`src/app/**/page.tsx`), общие компоненты — `src/components/`,
  запросы к API — через `src/lib/api.ts`, не напрямую `fetch` из компонентов.
- **Роли/доступ**: любой защищённый эндпоинт — `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`
  (см. `common/guards/`, `common/decorators/`).

## Перед PR

```bash
# backend
cd backend && npm run lint && npm run build

# frontend
cd frontend && npm run lint && npm run build
```

## Структура задач / roadmap

Актуальный список того, что реализовано полностью, что частично, и что нет —
раздел 8 в [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md).
