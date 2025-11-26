# Sensor Monitoring System - Assignment 4

This project demonstrates a fullstack application that seamlessly integrates both SQL (PostgreSQL) and NoSQL (Redis) databases, with the frontend abstracting the database complexity from users.

## Database Schema

![Database Schema](Data%20Schema.png)

## Requirements Fulfillment

### 1. Two Databases: One SQL and One NoSQL

**✅ Requirement:** Create minimum two databases, one SQL and one NoSQL database.

**Demonstration:**
- **SQL Database:** PostgreSQL (Relational Database) at `localhost:5432`
- **NoSQL Database:** Redis (Key-Value Store) at `localhost:6379`

Both databases are configured in `docker-compose.yml` and accessed through the backend API layer.

---

### 2. Minimum Five Tables/Collections in Each Database

**✅ Requirement:** Each database should contain at least five tables / collections.

**Demonstration:**

#### PostgreSQL Tables (5 tables):
1. **`owner`** - Stores owner information (id, first_name, last_name, email_address, dob)
2. **`location`** - Stores location data (id, longitude, latitude, country, city)
3. **`sensor`** - Stores sensor metadata (id, name, sensor_type, unit, threshold, owner_id, location_id)
4. **`observation`** - Stores sensor observations (id, sensor_id, value, timestamp)
5. **`alarm`** - Stores alarm records (id, sensor_id, alarm_value, timestamp)

#### Redis Collections (5+ key structures):
1. **`sensors:{sensor_id}`** (Hash) - Sensor metadata with latest_value
2. **`{sensor_id}/max_value`** (String) - Maximum value for a sensor
3. **`{sensor_id}/min_value`** (String) - Minimum value for a sensor
4. **`{owner_id}/fullname`** (String) - Owner's full name
5. **`{location_id}/location`** (String) - Location as "city, country"

---

### 3. Three Similar Tables/Collections and Two Different Ones

**✅ Requirement:** Both databases should have at least three similar tables / collections and at least two different ones.

**Demonstration:**

#### Similar Tables/Collections (3):
1. **Sensor Data:** PostgreSQL `sensor` table ↔ Redis `sensors:{sensor_id}` hash
2. **Owner Data:** PostgreSQL `owner` table ↔ Redis `{owner_id}/fullname` string
3. **Location Data:** PostgreSQL `location` table ↔ Redis `{location_id}/location` string

#### Different Tables/Collections (2+):
1. **PostgreSQL Only:** `observation` table, `alarm` table
2. **Redis Only:** `{sensor_id}/max_value`, `{sensor_id}/min_value`

---

### 4. Frontend Accesses Both Databases Simultaneously

**✅ Requirement:** Create a frontend that accesses both databases at the same time.

**Demonstration:**
The frontend communicates with a unified backend API (`/api/*`). The backend automatically queries both databases and combines results.

**Example:** Sensor detail page (`/sensors/:id`):
- Fetches sensor from PostgreSQL
- Fetches latest_value, max_value, min_value from Redis
- Fetches owner fullname and location from Redis cache
- Returns combined data as single response

**Implementation:** `backend/src/models/Sensor.ts` → `getByIdWithDetails()`

---

### 5. Print Data from Both Databases (Separately and Joined)

**✅ Requirement:** Can print out data from both databases (separately as well as join the similar tables from across the databases).

**Demonstration:**

#### Separate Data Display:
- **PostgreSQL Only:** `/sensors`, `/owners`, `/alarms` pages
- **Redis Only:** Sensor detail shows latest/max/min values, owner fullnames, location strings

#### Joined Data Display:
- **Sensor Detail Page:** Combines PostgreSQL sensor data with Redis cached values (latest, max, min, owner name, location)
- **Sensors List Page:** Displays sensors from PostgreSQL, joins with owner fullnames and location strings from Redis cache

**Implementation:** `backend/src/models/Sensor.ts` → `getByIdWithDetails()` and batch endpoints

---

### 6. Insert Data to Both Databases

**✅ Requirement:** Can insert data to both databases (without the user knowing where they are inserting data).

**Demonstration:**

#### Creating a Sensor:
- User clicks "Add Sensor" → Backend inserts into PostgreSQL `sensor` table AND initializes Redis hash `sensors:{sensor_id}`

#### Creating an Owner:
- User clicks "Add Owner" → Backend inserts into PostgreSQL `owner` table AND caches fullname in Redis `{owner_id}/fullname`

#### Creating an Observation:
- User adds observation → Backend inserts into PostgreSQL `observation` table AND updates Redis `sensors:{sensor_id}` with latest_value, max_value, min_value

**Implementation:** `backend/src/models/*.ts` → `create()` methods

---

### 7. Delete Data from Both Databases

**✅ Requirement:** Can delete data from both databases (without the user knowing which database the data is deleted from).

**Demonstration:**

#### Deleting a Sensor:
- User clicks "Delete Sensor" → Backend deletes from PostgreSQL `sensor` table AND removes Redis hash `sensors:{sensor_id}` and related keys

#### Deleting an Owner:
- User clicks "Delete Owner" → Backend deletes from PostgreSQL `owner` table AND removes Redis key `{owner_id}/fullname`

**Implementation:** `backend/src/models/*.ts` → `delete()` methods

---

### 8. Modify Data from Both Databases

**✅ Requirement:** Can modify data from both databases (without the user knowing which database is modified).

**Demonstration:**

#### Updating a Sensor:
- User edits sensor → Backend updates PostgreSQL `sensor` table AND updates Redis hash `sensors:{sensor_id}` if metadata changed

#### Updating an Owner:
- User edits owner → Backend updates PostgreSQL `owner` table AND updates Redis `{owner_id}/fullname` if name changed

**Implementation:** `backend/src/models/*.ts` → `update()` methods

---

### 9. User Abstraction from Database Complexity

**✅ Requirement:** User should not know that there are multiple and different databases existing on the background.

**Demonstration:**

- **Frontend:** Single API endpoint (`/api/*`), unified data models, no database indicators in UI
- **Backend:** Model layer handles all database interactions, automatic synchronization between databases
- **User Experience:** Users see unified views (e.g., sensor details showing PostgreSQL data + Redis cached values seamlessly)

**Implementation:** 
- Frontend: `frontend/src/api/` - Single API client
- Backend: `backend/src/models/` - Abstraction layer handling dual database operations

# AI Declaration
I acknowledge the use of OpenAI. (2025). ChatGPT (v4) [Large language model]. https://openai.com to generate materials for generating code. 

AI assistance was used in the following tasks: 

- Front-end code generation based on design
- Database initial mockup data
- README.md generation compared to the requirements