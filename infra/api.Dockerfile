FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY packages/auth/package*.json packages/auth/
COPY packages/database/package*.json packages/database/
RUN npm install
COPY . .
RUN npm run build --workspace @mlm-hosting-saas/database && npm run build --workspace @mlm-hosting-saas/api

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY packages/auth/package*.json packages/auth/
COPY packages/database/package*.json packages/database/
RUN npm install
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages ./packages
EXPOSE 4000
CMD ["sh", "-c", "npm run db:migrate && node apps/api/dist/apps/api/src/index.js"]
