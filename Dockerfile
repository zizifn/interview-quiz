
FROM node:lts-slim
WORKDIR /app
ENV NODE_ENV=production
# Copy server production dependencies
COPY  ./server/node_modules ./dist/node_modules

COPY ./server/dist ./dist

RUN mkdir -p ./dist/public
COPY  ./client/dist ./dist/public/

USER node

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
