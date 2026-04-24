FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json apps/web/
COPY packages/auth/package*.json packages/auth/
COPY packages/database/package*.json packages/database/
RUN npm install
COPY . .
RUN npm run build --workspace @mlm-hosting-saas/web

FROM nginx:1.27-alpine
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
