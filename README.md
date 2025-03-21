# interview-quiz

> [!IMPORTANT]
> Due to I used cloud service for DB, so when testing you may encounter **network faild** issue, just click again in the React app.

## Setup

### Local Setup

#### server

Please make sure you have `.env` file in the `server` folder.

```bash
cd server
npm install
npm run dev
```

> couchbase package have issue in 淘宝 mirror. Don't know why..

#### client

> Please make sure you have `vite.config.ts` proxy settings to point to your local Node.js API server.

```bash
cd client
npm install
npm run dev
```

### Docker Setup

```bash
docker run --rm -p 3001:3000 \
  -e TURSO_DATABASE_URL='' \
  -e TURSO_AUTH_TOKEN='' \
  -e COUCHBASE_URL='' \
  -e COUCHBASE_USER='' \
  -e COUCHBASE_PASSWORD='' \
  zizifn/interview-quiz:latest
```

### Online version

- https://quiz.121107.xyz/

  This is my personal VPS. Network speed should be very good from China. But it's not a good pattern to expose orgin server to the internet.

- https://quiz-cdn.121107.xyz/

  This is a CDN URL via Cloudflare.

## CI/CD

### Github Action for Build/Testing/Docker

https://github.com/zizifn/interview-quiz/actions

## Tech Stack Overview

### Server

- **Express.js** with Typescript

  Express.js wild used and can be customized.

- **RDBMS** for auth via turso.tech (Cloud Service)

  I personally like SQL.

- **Drizzle ORM**

  SQL is good abstraction, heavy ORM is not. Drizzle ORM is thin ORM. And most important, Drizzle ORM make database migration easy.

- **Lucia-auth**: Auth reference implementation
- NoSQL via **couchbase capella** (Cloud Service)

- **graphql-http** for graphql

  Choose this libary because it's simple!

- **swagger-ui** for openapi swagger 

- **Vitest**

### Client

- **React.js** with Vite & **Typescript**

- **Tailwind CSS**

  There are many CSS libaries. Tailwind CSS kind of best practice for CSS.

- UI library via https://ui.shadcn.com/ & Tailwind UI https://tailwindcss.com/plus

  just for try the most popular UI library.

- **Tanstack Query**

  I use Tanstack Query for data fetching. Without these kind libary, fetching data maybe is painful.

- Vitest

## Solution Overview

### Server

#### Directory Structure

- `/src`: Main source code directory
  - `/api`: API endpoints and business logic
    - `/auth`: Authentication features
    - `/restaurant`: Restaurant features
    - `/reservation`: Reservation features
      - `__tests__`: Unit tests for reservation features
      - `reservationRouter.ts`: Router for reservation endpoints
      - `reservationController.ts`: Controller for reservation business logic
      - `reservationService.ts`: Service for reservation business logic share with **GraphQL**
    - `/graphql`: GraphQL schema, resolvers, and router
    - `/healthCheck`: Health check
  - `/api-docs`: OpenAPI/Swagger router
  - `/common`: Shared utilities and middleware
    - `/middleware`: Express middleware (auth, error handling)
    - `/utils`: Utility functions
  - `/db`: Database access and schema definitions
    - `/couchbase`: Couchbase database connection and queries
      - `test` some code for preparing data into couchbase
    - `/schema.ts`: SQL schema definitions using Drizzle ORM
  - `index.ts`: Application entry point
  - `server.ts`: Express app configuration

#### Business Logic

##### Authentication

**Tables:**

- `user`: User table with user info hash_password
- `session`: Session table with user ID and session token

**APIs**:

- `/api/auth/signup`: User signup endpoint
- `/api/auth/login`: User login endpoint
- `/api/auth/logout`: User logout endpoint
- `/api/auth/user`: Get current user info endpoint

##### Resvervation

Couchbase Bucket: **interview-quiz**

Couchbase Scope: **quiz**

Couchbase Document:

- `reservations`: Reservation document
- `restaurant`: Restaurant documents

**Couchbase Index**:

Source code is in, need prepare it first `server/src/db/couchbase/test/index.ts`

- `reservationDateTime`: Index for reservation date and time
- `guestName`: Index for guest name
- `eservationDateTime,guestName `: Composite index for reservation date, time, and guest name

  **APIs**:

- `/api/restaurants`: Get all restaurants with tables info including capacity
- GET `/api/reservations`: Get all reservations
- POST `/api/reservations`: Create a new reservation, this will also update the restaurant document for table availability
- PUT `/api/reservations/:id`: Update an existing reservation
- PUT `/api/reservations/:id/status`: Cancel or complete a reservation, this will also update the restaurant document for table availability

**Graphql**:

- `/graphql`: GraphQL UI for querying and mutating reservations and restaurants
- Query: `reservations`: Get all reservations
- Query: `restaurants`: Get all restaurants with tables info including capacity
- Mutation: `createReservation`: Create a new reservation
- Mutation: `updateReservation`: Update an existing reservation
- Mutation: `updateReservationStatus`: Cancel or complete a reservation

#### Endpoints Details

- Swaager UI /api-docs/

  Please refer to the Swagger UI for the full list of endpoints.

- GraphQL UI /graphql

  Please refer to the GraphQL UI for the full list of queries.

  > If not load, please refersh it.

### Client

#### Directory Structure

- `/src`: Main source code directory

  - `/components`: React components

    - `/ui`: UI components library
      - `/catalyst`: Advanced UI building blocks via Taildwind UI
    - Application-specific components (NavBar, AuthForm, etc.)
      - `__tests__`: Unit tests for components
      - `AuthForm.tsx`: Authentication form for user login and registration
      - `NavBar.tsx`: Navigation bar component with user authentication status and mode switching
      - `LoadingSkeleton.tsx`: Loading placeholder components using Skeleton UI for async data fetching
      - `GuestView.tsx`: Component for displaying guest view of reservation
      - `EmployeeView.tsx`: Component for displaying employee view of reservation
      - `ReservationForm.tsx`: Form component for creating and editing reservations
      - `CancelReservation.tsx`: Component for cancel and complete reservations

  - `/lib`: Utility functions and library code
    - `/hooks`: Custom React query hooks
    - `/http`: API client and query functions
    - `/utils`: Utility functions
  - `/App.tsx`: Main application component
  - `/main.tsx`: Application entry point
  - `/index.css`: Global CSS styles
