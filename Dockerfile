# use node 16 alpine image
FROM node:18.12.1 as builder

# create work directory in app folder
WORKDIR /app

# install required packages for node image

RUN apt-get update && apt-get install -y openssl libssl-dev

# copy over package.json files
COPY package.json /app/
COPY package-lock.json /app/

# install all depencies
RUN npm ci && npm cache clean --force

# copy over all files to the work directory
ADD . /app

# prisma migrate
RUN npx prisma generate

# build the project
RUN npm run build

# start runner image
FROM node:18.12.1-slim as runner
RUN apt-get update && apt-get install -y openssl libssl-dev


WORKDIR /app

COPY --from=builder /app /app

# expose the host and port 3000 to the server
ENV HOST 0.0.0.0
#EXPOSE 3000

# run the build project with node
ENTRYPOINT ["node", ".output/server/index.mjs"]
# CMD ["npm", "run", "dev"]