import express from "express";
const app = express();
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { metrics } from "@opentelemetry/api";
const meter = metrics.getMeter("service-metrics");

app.use(express.json());

app.use((req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;

    requestCount.add(1, {
      method: req.method,
      route: req.route?.path ?? req.path,
      status: res.statusCode
    });

    requestDuration.record(durationSeconds, {
      method: req.method,
      route: req.route?.path ?? req.path,
      status: res.statusCode
    });
  });

  next();
});

const requestCount = meter.createCounter("http_server_request_count", {
  description: "Number of incoming HTTP requests"
});

// Duration histogram
const requestDuration = meter.createHistogram("http_server_request_duration_seconds", {
  description: "Duration of HTTP requests in seconds"
});

// load json data
import restaurants from "../Data/restraurants.json" with { type: "json" };
import menu from "../Data/menu.json" with { type: "json" };
import users from "../Data/users.json" with { type: "json" };
import orders from "../Data/orders.json" with { type: "json" };


// ---------------- RESTAURANT SERVICE ----------------

// Get all restaurants
app.get("/restaurants", (req, res) => {
  res.json(restaurants);
});

// Get restaurant by ID
app.get("/restaurants/:id", (req, res) => {
  const restaurant = restaurants.find(r => r.id == req.params.id);
  restaurant ? res.json(restaurant) : res.status(404).json({ error: "Not found" });
});

// Get all restaurants in a city
app.get("/restaurants/city/:city", (req, res) => {
  const list = restaurants.filter(r => r.city.toLowerCase() === req.params.city.toLowerCase());
  res.json(list);
});

// ---------------- MENU SERVICE ----------------

// Get menu for a restaurant
app.get("/menu/:restaurant_id", (req, res) => {
  const items = menu.filter(m => m.restaurant_id == req.params.restaurant_id);
  res.json(items);
});

// Get specific menu item
app.get("/menu/item/:id", (req, res) => {
  const item = menu.find(m => m.id == req.params.id);
  item ? res.json(item) : res.status(404).json({ error: "Not found" });
});


// ---------------- USER SERVICE ----------------

// Get all users
app.get("/users", (req, res) => {
  res.json(users);
});

// Get user by ID
app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  user ? res.json(user) : res.status(404).json({ error: "Not found" });
});


// ---------------- ORDER SERVICE ----------------

// List all orders
app.get("/orders", (req, res) => {
  res.json(orders);
});

// Get order by ID
app.get("/orders/:id", (req, res) => {
  const order = orders.find(o => o.id == req.params.id);
  order ? res.json(order) : res.status(404).json({ error: "Not found" });
});

// Place new order
app.post("/orders", (req, res) => {
  const newOrder = {
    id: orders.length + 1,
    ...req.body
  };
  orders.push(newOrder);
  res.json(newOrder);
});


// ---------------- START SERVER ----------------
app.listen(3001, () => {
  console.log("Server running on port 3000");
});
