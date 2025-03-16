# interview-quiz

## Setup

### Local Setup

#### server

```bash
cd server
npm install
npm run start:dev
```

#### client

```bash
cd client
npm install
npm run start:dev
```

### Docker Setup

```bash
sudo docker run --rm -p 8888:8080 \
  -e NODE_ENV='development' \
  -e CORS_ORIGIN='*' \
  -e COMMON_RATE_LIMIT_WINDOW_MS=1000 \
  -e COMMON_RATE_LIMIT_MAX_REQUESTS=20 \
  -e TURSO_DATABASE_URL='' \
  -e TURSO_AUTH_TOKEN='e' \
  zizifn/interview-quiz:latest
```

### Online version

- [https://interview-quiz.vercel.app](https://interview-quiz.vercel.app)

## CI/CD

### Github Action for Push to Docker Hub

https://github.com/zizifn/interview-quiz/actions/workflows/build.yml
