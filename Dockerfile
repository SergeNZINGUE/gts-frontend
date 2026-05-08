# Stage 1: Build the Angular application
FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm
ENV PNPM_HOME="/app/.pnpm"
COPY .npmrc ./
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
RUN pnpm rebuild
COPY . .
RUN pnpm run build --configuration=production

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/Modernize/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
