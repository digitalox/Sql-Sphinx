# SqlSphinx

A modern single-page app for comparing SQL Server server-level configurations side by side. Connect two instances, run a comparison, and instantly see what differs.

## Features

- Fetches all `sys.configurations` settings and key server properties from two SQL Server instances in parallel
- Side-by-side diff view with differences highlighted and a "Show diffs only" filter
- Summary stats — total settings, differences, matching
- Configurable connection strings, API URL, and console debug verbosity, persisted to browser storage
- Swagger UI available in development for direct API testing

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET 10 Web API |
| Database driver | Microsoft.Data.SqlClient |
| Frontend | React 18 + TypeScript |
| Routing | React Router v6 |
| HTTP client | Axios |

## Project Structure

```
Sql-Sphinx/
├── SqlSphinx.Api/          # .NET Web API
│   ├── Controllers/        # ConfigController — /api/config/defaults, /api/config/compare
│   ├── Models/             # ServerConfigItem, ServerProperties, ComparisonResult
│   └── Services/           # SqlConfigService — queries & diffs
└── sql-sphinx-ui/          # React SPA
    └── src/
        ├── context/        # SettingsContext — localStorage-backed settings
        ├── components/     # Sidebar navigation
        └── pages/          # ComparePage, SettingsPage
```

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- Access to two SQL Server instances

### 1. Configure default servers

Edit `SqlSphinx.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "Server1": "Server=YOUR_SERVER_1;Database=master;Trusted_Connection=True;TrustServerCertificate=True;",
  "Server2": "Server=YOUR_SERVER_2;Database=master;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

These are loaded as defaults in the UI. You can override them per-session on the Settings page without editing the file.

### 2. Run the API

```bash
cd SqlSphinx.Api
dotnet run --launch-profile http
```

API runs on `http://localhost:5181`. Swagger UI is available at `http://localhost:5181/swagger`.

### 3. Run the UI

```bash
cd sql-sphinx-ui
npm install
npm start
```

App opens at `http://localhost:3000`.

## API Reference

### `GET /api/config/defaults`

Returns the default connection strings from `appsettings.json`.

### `POST /api/config/compare`

Connects to both servers, fetches configurations, and returns a diff.

**Request body:**
```json
{
  "server1ConnectionString": "Server=...;",
  "server2ConnectionString": "Server=...;"
}
```

**Response:** `ComparisonResult` with server properties, all config settings, and a diff list indicating which values differ.

## Settings

The Settings page (accessible from the sidebar) lets you configure:

| Setting | Description |
|---|---|
| Server 1 connection string | Default connection for the left-hand server |
| Server 2 connection string | Default connection for the right-hand server |
| API Base URL | Backend URL (default: `http://localhost:5181/api`) |
| Debug verbosity | Console logging level: None / Error / Warning / Info / Debug / Verbose |

All settings are saved to `localStorage` and survive page reloads.
