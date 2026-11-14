# Étape 1 : construction de l'application Angular (npm + package-lock.json)
FROM node:22-alpine AS build
WORKDIR /app
COPY .npmrc package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# Étape 2 : servir avec Nginx
FROM nginx:alpine
# Certificats racine, nécessaires à proxy_ssl_verify (nginx.conf)
RUN apk add --no-cache ca-certificates
COPY --from=build /app/dist/Modernize/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
