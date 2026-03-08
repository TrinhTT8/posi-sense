# PosiSense Backend

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Set your MongoDB connection string in `.env`:
   ```
   MONGODB_URI=your_mongodb_connection_string_here
   PORT=5000
   ```
3. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /api/aquarium` — List all aquarium items
- `POST /api/aquarium` — Add a new aquarium item (expects JSON body)

## Example AquariumItem Model

```
{
  name: "Clownfish",
  type: "fish",
  label: "Clownfish",
  dateUnlocked: "2026-03-07T00:00:00.000Z",
  userId: "user123"
}
```
