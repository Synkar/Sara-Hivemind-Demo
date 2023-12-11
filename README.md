# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

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

# Demo

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

The `Request` happens when someone places an order, so the `robot` needs to move to the `pickup` point grab that order and then move to `delivery`.

To create a request you need the `Operation` where you want this request to go, then a `pickup` and a `delivery` `landmark`:

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
