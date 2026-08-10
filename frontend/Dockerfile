FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Both of these are read inside next.config.mjs's async rewrites()/build, which
# Next.js evaluates once at build time (its result is frozen into the routes
# manifest) -- so they must be build args here, not runtime environment
# variables in docker-compose.yml. "http://backend:8000" is the Docker-internal
# address of the backend service and is correct regardless of which HOST port
# BACKEND_PORT maps it to, so the default below needs no per-deployment change.
ARG BACKEND_INTERNAL_URL=http://backend:8000
ENV BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL}
# NEXT_PUBLIC_API_URL is also inlined into the browser bundle; leave unset
# (default) unless the browser must call the backend directly at a different
# origin than this app -- see README.
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
