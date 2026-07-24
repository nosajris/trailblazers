# Multi-stage production build for PAOZ Trailblazers
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build
RUN npm run build:admin

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/apps/web/build ./apps/web/build
COPY --from=build /app/apps/admin/build ./apps/admin/build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

EXPOSE 5173 5174
CMD ["npm", "run", "preview"]
