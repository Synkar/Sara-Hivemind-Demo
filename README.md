# Hivemind Dashboard Demo

A Nuxt Project configured to use Sara Hivemind Service to send requests to robots performing missions.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

First create a `.env` file with the variable `DATABASE_URL` and set it to a _Postgresql_ URL.

Then run:

```bash
# npx
npx prisma db push

# pnpm
pnpm exec prisma db push
```

And finally start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# Configuration

## Env Settings

You can configure some env fields with a .env file in your project or by passing environment variables to your project. Check the `.env.example` file to see what you can change.

## Change Database

We use Prisma as our ORM with PostgreSQL, but you can change the database provider to any other Prisma-supported database (PostgreSQL, MySQL, SQLite, SQL Server, MongoDB, CockroachDB). You can change the provider in the `./prisma/schema.prisma` file as shown in the example:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE-URL")
}
```

With the exception of MongoDB, all other providers probably won't need changes to the DB Schema. However, if you'd like to use `MongoDB`, you can change the `id` field to the following (on each model):

```prisma
id  String  @id @default(auto()) @map("_id") @db.ObjectId
```

And change the relation fields to the following:

```prisma
model Users {
  ...
  selectedCredential String @db.ObjectId
}
model Credentials {
  ...
  usersId String @db.ObjectId
}
```

Check out the [Prisma Schema Configuration](https://www.prisma.io/docs/orm/prisma-schema/overview) for more information and help how to convert field for each DB

## SSL Cookies

We use cookies to store our JWT Token when authenticated.

By default, our tokens are secure only in production, but you can change that in the `nuxt.config.ts` file in the prop: `$development.runtimeConfig.public.IS_SECURE` to change for `development` and `$production.runtimeConfig.public.IS_SECURE` for `production`. We strongly recommend keeping it enabled in production.

## Language Change

We have this project in both `EN` and `PT-BR` languages you can change the default language on `nuxt.config.ts` file on the prop `i18n.defaultLocale`, from `en` to `pt`, your change this in runtime by creating a button or toggle and usign the following code:

```javascript
const { locale } = useI18n();
locale.value = "en";
```

Changing from `en` to `pt` when needed, if you like to translate the demo to any other language just create a `"language".json` in the `locales` folder and change the file `nuxt-i18n.ts` to include the new locale as following:

```javascript
import en from "./locales/en.json";
import pt from "./locales/pt.json";
// import the new locale file here

export default {
  legacy: false,
  locale: "en",
  messages: {
    en,
    pt,
    // then add here
  },
};
```

After that go to `nuxt.config.ts` and add the new locale on the prop list `i18n.locales`.

Checkout the [i18n module configuration page](https://i18n.nuxtjs.org/getting-started/setup) for more information about it.

# Demo Usage

In this demo you will simulate the creation of one `Request`, choosing an `Operation` and two `Landmarks` (`Pickup` and `Delivery`).

Access the live [Demo](https://dash-demo.sara.synkar.com/) here.

## Operations

Operations are created by passing `Name`, `Description`, `Locality` and `OperationTypes`:

```json
//Operation
{
  "name": "My Operation",
  "description": "My Operation Description",
  "locality": "synkar_simulators",
  "operationTypes": [
    {
      "operationTypeUuid": "{{ operationType_uuid }}",
      "pickupStages": [
        {
          "stageUuid": "{{ stage_uuid }}",
          "order": 1
        }
      ],
      "deliveryStages": [
        {
          "stageUuid": "{{ stage_uuid }}",
          "order": 1
        }
      ]
    }
  ]
}
```

This will define where the `Operation` is happening, the `Operation` above will only recieve requests from `synkar_simulators` and only robots from that `locality` will operate.

## Operation Types

Define the type of the `Operation` and what kind of `Stages` it will use:

```json
//Operation type
{
  "name": "Simple Single Floor",
  "description": "Operation Type for Single Floor Missions",
  "rule": "currentLandmark.floor == nextLandmark.floor",
  "orderPriority": 1,
  "pickupStages": [
    {
      "name": "Packing",
      "description": "Robot is packing the container",
      "params": []
    }
  ],
  "deliveryStages": [
    {
      "name": "Unpacking",
      "description": "Robot is unpacking the container",
      "params": []
    }
  ]
}
```

The type above states that the `Operation` is single floor, so it uses `Stages` that do not require calling the elevator.

## Locality

Represents where the `Operation` takes place, that way only robots that belong to the same `Locality` will receive its requests.

It also have `Landmarks` that are points where the robot will `pickup` and `delivery` its cargo:

```json
//Landmark
{
  "uuid": "{{ landmark_uuid }}",
  "name": "TAG 1",
  "description": null,
  "tag": 1,
  "floor": 0,
  "mapId": "{{ map_id }}",
  "extraFields": {
    "restaurant": "Cafeteria iFood"
  }
}
```

## Requests

The `Request` happens when someone places an order, so the `robot` needs to move to the `pickup` point, grab that order, and then move to `delivery`.

To create a request, you need the `Operation` where you want this request to go, then a `pickup` and a `delivery` `landmark`:

```json
//endpoint
/operations/{{operationUuid}}/requests

//body
{
  "pickup": {
    "landmark": "{{ landmark_uuid }}",
    "windowTime": [
      0,
      9999
    ]
  },
  "delivery": {
    "landmark": "{{ landmark_uuid }}",
    "windowTime": [
      0,
      9999
    ]
  },
  "demand": 1
}
```
