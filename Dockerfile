# use node 16 alpine image
FROM node:18.17.1-alpine3.17 as builder

# create work directory in app folder
WORKDIR /app

# install required packages for node image
RUN apk --no-cache add openssh g++ make python3 git

# copy over package.json files
COPY package.json /app/
COPY package-lock.json /app/

# install all depencies
RUN npm ci && npm cache clean --force

# copy over all files to the work directory
ADD . /app

# prisma migrate
RUN apk add openssl1.1-compat
RUN npx prisma generate

# build the project
RUN npm run build

# start runner image
FROM node:18.17.1-alpine3.17 as runner
RUN apk add openssl1.1-compat


WORKDIR /app

COPY --from=builder /app /app

# expose the host and port 3000 to the server
ENV HOST 0.0.0.0
#EXPOSE 3000

# run the build project with node
ENTRYPOINT ["node", ".output/server/index.mjs"]
# CMD ["npm", "run", "dev"]
