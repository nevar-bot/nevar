FROM node:20-bullseye

WORKDIR /app/
COPY package.json /app/package.json

RUN npm install

COPY tsconfig.json /app/tsconfig.json
COPY .swcrc /app/.swcrc
COPY assets/ /app/assets/
COPY locales/ /app/locales/
COPY src/ /app/src/

RUN npm run build
EXPOSE 8085
EXPOSE 8075
CMD ["npm", "start"]