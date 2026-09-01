# Multi-stage production build for PAOZ Trailblazers.
#
# The previous version could not work: it copied `apps/*/build`, which neither
# adapter-vercel nor adapter-auto produces, and its `CMD npm run preview` served
# only the web app. Both apps now build with adapter-node into `build/`, and
# the image runs one of them chosen by APP at start time.
#
# Build:  docker build -t trailblazers .
# Run:    docker run -e APP=web   -e DATABASE_URL=... -e SECRET_KEY=... -p 5173:5173 trailblazers
#         docker run -e APP=admin -e DATABASE_URL=... -e SECRET_KEY=... -p 5174:5174 trailblazers
#
# NOTE: this needs `@sveltejs/adapter-node` and the apps' svelte.config.js
# selecting it when BUILD_TARGET=node. Vercel deploys do not use this file.

FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS dependencies
# Lockfile-driven install, with dev dependencies since the build needs them.
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm ci --include=dev

FROM dependencies AS build
COPY . .
ENV BUILD_TARGET=node
RUN npm run build:web && npm run build:admin
# Drop dev dependencies from the tree that ships.
RUN npm prune --omit=dev

FROM base AS runner
# Never run as root.
RUN addgroup -S trailblazers && adduser -S trailblazers -G trailblazers

COPY --from=build --chown=trailblazers:trailblazers /app/apps/web/build ./apps/web/build
COPY --from=build --chown=trailblazers:trailblazers /app/apps/admin/build ./apps/admin/build
COPY --from=build --chown=trailblazers:trailblazers /app/node_modules ./node_modules
COPY --from=build --chown=trailblazers:trailblazers /app/package.json ./package.json

USER trailblazers

# Which app this container serves.
ENV APP=web
ENV WEB_PORT=5173
ENV ADMIN_PORT=5174
EXPOSE 5173 5174

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD node -e "const p=process.env.APP==='admin'?process.env.ADMIN_PORT:process.env.WEB_PORT;require('http').get('http://127.0.0.1:'+p+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["sh", "-c", "if [ \"$APP\" = \"admin\" ]; then PORT=$ADMIN_PORT node apps/admin/build/index.js; else PORT=$WEB_PORT node apps/web/build/index.js; fi"]
