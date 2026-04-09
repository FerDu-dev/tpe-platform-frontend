# Stage 1: Build Stage
FROM node:24-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package management files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy the rest of the application files
COPY . .

# Set build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_FRONTEND_URL

# Build the application for production
# Vite will pick up these variables from the environment during the build
RUN VITE_API_URL=$VITE_API_URL VITE_FRONTEND_URL=$VITE_FRONTEND_URL npm run build:production

# Stage 2: Production Stage
FROM nginx:alpine AS production

# Set default port
ENV PORT=80

# Write a minimal Nginx configuration with a placeholder for the port
RUN echo "server { \
    listen 80; \
    server_name localhost; \
    location /health { \
        access_log off; \
        add_header Content-Type text/plain; \
        return 200 'OK'; \
    } \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Copy built static files from build stage to Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Inform Docker about the port
EXPOSE $PORT

# Replace the port in the configuration at runtime and start Nginx
CMD ["sh", "-c", "sed -i \"s/listen 80;/listen $PORT;/\" /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
