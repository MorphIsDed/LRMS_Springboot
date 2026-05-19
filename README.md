# LRMS (Lodging & Restaurant Management System)

## Overview
A full‑stack Spring Boot + Vite/React application that manages hotel rooms, restaurant menus, bookings, and orders. The latest release adds **Third‑Party Partner API** support (Zomato, Swiggy, Booking.com) with secure API‑Key authentication, request logging, and an admin dashboard for usage analytics.

## Features
- **Partner API** (`/api/v1/partners/**`) – list rooms, create/update/cancel bookings, fetch menu, place/update/cancel orders.
- **API‑Key authentication** – validated by `ApiKeyAuthenticationFilter`, logs stored in `api_usage_logs`.
- **Admin Dashboard** – React view (`PartnerApiDashboard`) showing total calls, error rate, active partners, traffic distribution, and recent logs.
- **Database migrations** – Flyway script `V3__partner_api.sql` adds `api_keys` & `api_usage_logs` tables.
- **Modern UI** – Glassmorphism‑style frontend with premium design.

## Prerequisites
- **Java 21** (or compatible JDK)
- **Gradle 8+** (wrapper included)
- **Node.js 20+** and **npm** (frontend)
- **PostgreSQL** instance (configured in `src/main/resources/application‑*.yml`)

## Getting Started
```bash
# Clone the repo
git clone <repo-url>
cd LRMS

# Backend
./gradlew bootRun   # starts Spring Boot on http://localhost:8081

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev   # Vite dev server on http://localhost:5173
```

The backend will seed a test API key on first start (shown in console) – use it as `X-API-KEY` for partner requests.

## Building for Production
```bash
# Backend JAR
./gradlew build   # produces build/libs/LRMS-*.jar

# Frontend production bundle
cd frontend
npm run build    # outputs to frontend/dist
```

## API Documentation
The full partner API documentation is available as an HTML file:
`docs/API_Documentation.html`
Open it in a browser or convert to PDF via **Print → Save as PDF**.

## Requirements File
The project’s dependency list is captured in `requirements.txt` for quick reference:
- Java 21
- Gradle 8
- Spring Boot 3.2
- PostgreSQL driver
- Lombok, Flyway, Jackson, etc.
- Node.js 20+, npm
- Vite, React, TypeScript, Tailwind CSS, Lucide React

## Contributing
1. Fork the repository
2. Create a feature branch
3. Follow the existing coding style (Lombok, Spring conventions, React TS)
4. Run tests (`./gradlew test` and `npm run test` if configured)
5. Submit a pull request

## License
MIT License – see `LICENSE` file.
