FROM node:20-alpine AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# --- Production stage ---
FROM node:20-alpine
WORKDIR /app

# use serve to host static site
RUN npm install -g serve
COPY --from=build /app/dist ./dist

CMD ["serve", "-s", "dist", "-l", "3000"]
