# DRIVENT ENDPOINTS

# Table of Contents

- [ACTIVITIES](#activities)

# ACTIVITIES

All the endpoints related to activities. All the endpoints require a token to be passed in the header of the request following this example:

```json
headers: {
    "Bearer token": "7bf33b5f-a218-4439-bde9-3ae2ae2afa69"
}
```

## SUBSCRIBE TO ACTIVITY

Allows the user to subscribe to an activity.

### Request

`POST /activities/`

### Request Body

```json
{
  "activityId": 1
}
```

### Response

    HTTP/1.1 201 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 201 CREATED
    Connection: close
    Content-Type: application/

    []

## GET ACTIVITIES BY DATE

Allows the user to get all the activities by date.

### Request

`GET /activities/date`

### Request Body

```json
{
  "date": "2021-05-05"
}
```

### Response

```json
[
  {
    "id": 16,
    "name": "Conference Talk",
    "startsAt": "09:00",
    "placeId": 1,
    "endsAt": "10:00",
    "createdAt": "2023-05-24T01:13:40.429Z",
    "updatedAt": "2023-05-24T01:13:40.426Z",
    "Place": {
      "id": 1,
      "name": "Auditório Principal",
      "capacity": 100,
      "createdAt": "2023-05-24T00:50:23.225Z",
      "updatedAt": "2023-05-24T00:50:23.219Z"
    },
    "date": "2023-06-02"
  }
]
```

## GET ACTIVITY DAYS

Allows the user to get all the activity days.

### Request Body

`GET /activities/days`

### Response

```json
[
  {
    "date": "2023-06-02",
    "day": "sexta-feira"
  },
  {
    "date": "2023-06-03",
    "day": "sábado"
  },
  {
    "date": "2023-06-04",
    "day": "domingo"
  }
]
```

## GET PLACES AND ITS ACTIVITIES BY DATE

Allows the user to get all the places and its activities.

### Request

`GET /activities/places/date`

### Request Body

```json
{
  "placeId": 1,
  "date": "2023-06-02"
}
```

### Response

```json
[
  {
    "id": 16,
    "name": "Conference Talk",
    "startsAt": "09:00",
    "placeId": 1,
    "endsAt": "10:00",
    "createdAt": "2023-05-24T01:13:40.429Z",
    "updatedAt": "2023-05-24T01:13:40.426Z",
    "Place": {
      "id": 1,
      "name": "Auditório Principal",
      "capacity": 100,
      "createdAt": "2023-05-24T00:50:23.225Z",
      "updatedAt": "2023-05-24T00:50:23.219Z"
    },
    "date": "2023-06-02"
  }
]
```
