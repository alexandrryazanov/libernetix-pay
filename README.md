# Libernetix Payment Integration

This project is a NestJS-based backend and a simple frontend for handling server-to-server payments using the [Libernetix API](https://gate.libernetix.com/api/). The implementation includes payment creation, secure S2S payment processing, health checks, logging, guards, webhook handling, and tests.

---

## ✅ What’s Implemented

### Backend (`/backend`)
- ✅ **NestJS + TypeScript** backend architecture with modular structure.
- ✅ **Libernetix SDK integration** for:
  - Creating purchases via `purchasesCreate`.
  - Reading purchases via `purchasesRead`.
- ✅ **S2S Payment flow** (`POST /payment/s2s`) using raw `axios` calls to Libernetix `direct_post_url`.
- ✅ **Purchase Intent flow** (`POST /payment/intent`) with email check and dynamic order simulation.
- ✅ **OrderService** to simulate order retrieval and confirmation (mocked logic).
- ✅ **Webhook handling**:
  - `POST /webhooks/libernetix` endpoint for processing Libernetix events.
  - Signature validation via custom `WebhookSignatureGuard`.
- ✅ **Guards**:
  - `AuthGuard` — placeholder for future auth (currently allows request for integration testing).
  - `WebhookSignatureGuard` — validates `x-signature` header for secure webhook access.
- ✅ **DTO validation with `class-validator`**:
  - All incoming requests are validated using DTOs with decorators like `@IsString`, `@IsNotEmpty`, etc.
  - Global `ValidationPipe` is used with `whitelist` and `forbidNonWhitelisted` options.
- ✅ **Healthcheck endpoint** (`/health`) using `@nestjs/terminus`:
  - Verifies backend availability.
  - Pings external Libernetix API.
- ✅ **Security**:
  - `helmet` middleware to set secure HTTP headers.
  - `express-rate-limit` to limit requests per IP.
- ✅ **Structured logging with `nestjs-pino`**:
  - All HTTP requests are logged automatically.
  - Additional service-level logs for payments and webhooks.
- ✅ **Unit tests** for `PaymentService`:
  - Email mismatch → throws error.
  - Successful purchase creation and S2S payment.
- ✅ **E2E test** for `POST /payment/s2s`:
  - Mocks `OrdersService`, Libernetix SDK, and Axios.
  - Asserts successful end-to-end flow.
- ✅ **Custom decorator** for getting user from guard
- ✅ **Configs** for getting env variables

### Frontend (`/frontend`)
- ✅ Basic React app built with Vite.
- ✅ Payment form: order ID, card details, and optional fields.
- ✅ Payment flow with/without 3DS secure
- ✅ Custom hooks useFetch / useMutate
- ✅ Toast messages for errors

---

## 🛠 What Can Be Improved (Future TODOs)

- [ ] Add real authentication using API key or JWT (currently simulated with `AuthGuard`).
- [ ] Persist orders in a real database (e.g., PostgreSQL or MongoDB).
- [ ] Validate webhook payloads more strictly and store events.
- [ ] Improve frontend with better UX, validation, and status feedback.
- [ ] Full CRUD for orders and users.
- [ ] Add Swagger for API documentation.
- [ ] Extend E2E test coverage to webhooks and health.
- [ ] Add CI/CD workflow (GitHub Actions or GitLab CI).
- [ ] Improve observability with OpenTelemetry for tracing.
- [ ] Multi-env `.env.test`, `.env.prod`, `.env.local` support.

---

## 🚀 How to Run

### 📦 Backend (NestJS)

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Set environment variables**

 Create `.env` in `/backend`:

```env
LIBERNETIX_BASE_URL=https://gate.libernetix.com/api
LIBERNETIX_API_KEY=<your-api-key>
LIBERNETIX_BRAND_ID=<your-brand-id>
LIBERNETIX_S2S_TOKEN=<your-s2s-token>
```

🔐 Libernetix S2S Certificate

Libernetix S2S payments require a PEM-formatted certificate to securely sign requests.

How to add your certificate:
1.	Create a file named libernetix.pem in the /backend/keys directory
2.	Paste your Libernetix-provided PEM key content into the file.
3.	Make sure it is not committed to version control (add it to .gitignore).

🌐 Webhook Testing with ngrok

Libernetix must be able to send webhook events to your local server — for that, you’ll need to create a webhook according API docs https://gate.libernetix.com/api/#/Webhooks/webhooks_create.

3. **Run the server**

```bash
npm run start:dev
```

4. **Run tests**

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e
```

---

### 💻 Frontend (React)

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Set environment variable**

Create `.env`:

```env
VITE_BACKEND_BASE_URL=http://localhost:8080
```

3. **Run the app**

```bash
npm run dev
```

This will start the frontend on http://localhost:5173 (Vite default).

---


## 👤 Author

Built by **Alexander Riazanov** as part of an integration test task.