FROM node:20-alpine
WORKDIR /app

# Install production deps only (no TypeScript needed — dist/ is pre-built)
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy pre-compiled dist and any runtime assets
COPY dist/ ./dist/

EXPOSE 4000
CMD ["node", "dist/index.js"]
