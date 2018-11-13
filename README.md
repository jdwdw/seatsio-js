# seatsio-js
This is the official JavaScript client library (for both Node and browser) for [Seats.io V2 REST API](https://docs.seats.io/docs/api-overview).

[![Build Status](https://travis-ci.org/seatsio/seatsio-js.svg?branch=master)](https://travis-ci.org/seatsio/seatsio-js)

# WIP
Please note that this project is still in development.

## Installing
For Node, you can install using npm:

```sh
npm install seatsio
```
For browser, you can directly include it from GitHub:

```html
<script src="https://github.com/seatsio/seatsio-js/releases/download/<RELEASE_TAG>/SeatsioClient.js"></script>
```

## Versioning

seatsio-js only uses major version numbers: v2, v3, v4 etc. Each release - backwards compatible or not - receives a new major version number.

The reason: we want to play safe and assume that each release _might_ break backwards compatibility.

Please note that any version below v2 is not production ready.

## Examples

Due to the asynchronous nature of the API calls, this library uses `async/await` and `for await` loops which are part of the ES 8. `for await` loops gained native support from Node 10 onwards.

### Creating a chart and an event
Once you create a new `SeatsioClient` using your _secret key_, you can create _charts_ and then _events_. You can find your _secret key_ in the Settings section of your account: https://app.seats.io/settings. It is important that you keep your _secret key_ private and not expose it in-browser calls unless it is password protected.

```js
const client = new SeatsioClient(<SECRET_KEY>);
let chart = await client.charts.create();
let event = await client.events.create(chart.key);
console.log(`Created a chart with key ${chart.key} and an event with key: ${event.key}`);
```

### Booking objects

Booking an object changes its status to `booked`. Booked seats are not selectable on a rendered chart.
[https://docs.seats.io/docs/api-book-objects](https://docs.seats.io/docs/api-book-objects).

```js
const client = new SeatsioClient(<SECRET_KEY>);
await client.events.book(<AN_EVENT KEY>, ['A-1', 'A-2']);
```

### Booking objects that are on `HOLD`

```js
const client = new SeatsioClient(<SECRET_KEY>);
await client.events.book(<AN EVENT KEY>, ["A-1", "A-2"], <A_HOLD_TOKEN>);
```

### Booking general admission (GA) areas

Either

```js
const client = new SeatsioClient(<SECRET_KEY>);
await client.events.book(<AN EVENT KEY>, ["GA1", "GA1", "GA1"]);
```

Or:

```js
const client = new SeatsioClient(<SECRET_KEY>);
await client.events.book(<AN_EVENT_KEY>, {"objectId": "GA1", "quantity" : 3});
```

### Releasing objects

Releasing objects changes its status to `free`. Free seats are selectable on a rendered chart.

[https://docs.seats.io/docs/api-release-objects](https://docs.seats.io/docs/api-release-objects).

```js
const client = new SeatsioClient(<SECRET_KEY>);
await client.events.release(<AN EVENT KEY>, ["A-1", "A-2"]);
```

### Changing object status

Changes the object status to a custom status of your choice. If you need more statuses than just booked and free, you can use this to change the status of a seat, table or booth to your own custom status.

[https://docs.seats.io/docs/api-custom-object-status](https://docs.seats.io/docs/api-custom-object-status)

```js
const client = new SeatsioClient(<SECRET_KEY>);
await client.events.changeObjectStatus(<AN EVENT KEY>, ["A-1", "A-2"], "unavailable");
```

### Listing charts
You can list all charts using `listAll()` method which returns an asynchronous iterator `AsyncIterator`. You can use `for await` loop to retrieve all charts.

```js
const client = new SeatsioClient(<SECRET_KEY>);
let chart1 = await client.charts.create();
let chart2 = await client.charts.create();
let chart3 = await client.charts.create();
for await(let chart of client.charts.listAll()){
    console.log(`Chart key: ${chart.key}`)
}
```

You can also call the `next()` method to manually iterate over charts.
```js
const client = new SeatsioClient(<SECRET_KEY>);
let chart1 = await client.charts.create();
let chart2 = await client.charts.create();
let chart3 = await client.charts.create();
let charts = client.charts.listAll();
let chartsIterator = charts[Symbol.asyncIterator]();
let firstChart = await chartsIterator.next(); //retrieves the first page of charts, returns the latest in queue
let secondChart = await chartsIterator.next(); //returns the next chart in the first page
```

## Error Handling
When an API call results in an error, the promise returned from the `axios` call is rejected with the response received from the server. This response contains a message string describing what went wrong, and also two other properties:

- `messages`: an array of error messages that the server returned. In most cases, this array will contain only one element.
- `requestId`: the identifier of the request you made. Please mention this to us when you have questions, as it will make debugging easier.
