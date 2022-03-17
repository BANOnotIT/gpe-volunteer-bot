FROM node:14 as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install
COPY tsconfig.json ./
COPY src ./src
RUN yarn build

FROM node:14

ENV NODE_ENV production

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --prod
COPY --from=build /app/dist/ /app/dist/
COPY files /app/files
COPY config /app/config

CMD ["yarn", "start"]
