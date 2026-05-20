# Used Cars GraphQL API Reference

> **Endpoint**: `https://bmw-backend.29rwihxro1te.eu-de.codeengine.appdomain.cloud/graphql`
>
> **Method**: `POST` with `Content-Type: application/json`
>
> **Auth**: Header `x-api-key: bmw-demo-api-key-2026`

All data is proxied live from BMW UK's used car inventory (~12,500 vehicles). There is no local database for vehicle data — every query returns real-time results.

---

## Quick Start

```bash
curl -X POST https://bmw-backend.29rwihxro1te.eu-de.codeengine.appdomain.cloud/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: bmw-demo-api-key-2026" \
  -d '{"query":"{ vehicleSeries { name count imageUrl } }"}'
```

---

## Queries

### 1. `vehicleSeries` — Browse All Series

Returns all BMW series with live vehicle counts and hero images. Use this for the landing page / series picker.

```graphql
query {
  vehicleSeries {
    name # "1 Series", "3 Series", "X", "M", "BMW i", "Alpina", etc.
    count # Live count of available vehicles (e.g. 1332)
    imageUrl # Hero image URL (webp, hosted on Google Cloud Storage)
  }
}
```

**Example response:**

```json
{
  "data": {
    "vehicleSeries": [
      {
        "name": "BMW i",
        "count": 1845,
        "imageUrl": "https://storage.googleapis.com/uvl-bmw-uk-master/media/cache/..."
      },
      { "name": "1 Series", "count": 1711, "imageUrl": "https://..." },
      { "name": "3 Series", "count": 1332, "imageUrl": "https://..." },
      { "name": "X", "count": 4804, "imageUrl": "https://..." },
      { "name": "M", "count": 764, "imageUrl": "https://..." }
    ]
  }
}
```

**Notes:**

- `name` values to pass as search filters: `"1 Series"`, `"2 Series"`, `"3 Series"`, `"4 Series"`, `"5 Series"`, `"6 Series"`, `"7 Series"`, `"8 Series"`, `"BMW i"`, `"M"`, `"X"`, `"Z"`, `"Alpina"`

---

### 2. `searchUsedVehicles` — Search & Filter Vehicles

Main search query. Supports filtering by series, fuel type, body type, price range, mileage, and sorting. Returns paginated results plus filter facets.

```graphql
query SearchVehicles($input: UsedVehicleSearchInput!) {
  searchUsedVehicles(input: $input) {
    totalCount
    totalPages
    page
    pageSize
    vehicles {
      id
      vin
      series
      model
      brand
      bodyType
      condition
      price
      estimatedMonthlyPayment
      financeAvailable
      registrationDate
      mileage
      fuelType
      transmission
      colour
      power
      insuranceGroup
      electricRange
      mpgCombined
      co2Emissions
      images {
        url
        alt
        order
      }
      videoUrl
      badges
      standardFeatures
      optionalPacks
      dealer {
        id
        name
        phone
      }
    }
    facets {
      series {
        value
        count
      }
      bodyTypes {
        value
        count
      }
      fuelTypes {
        value
        count
      }
      transmissions {
        value
        count
      }
      priceRange {
        min
        max
      }
      mileageRange {
        min
        max
      }
      yearRange {
        min
        max
      }
    }
  }
}
```

**Variables — `UsedVehicleSearchInput`:**

| Field           | Type              | Description                   | Example                    |
| --------------- | ----------------- | ----------------------------- | -------------------------- |
| `series`        | `[String!]`       | Filter by series name(s)      | `["3 Series", "5 Series"]` |
| `bodyTypes`     | `[BodyType!]`     | Filter by body type(s)        | `["SUV", "SALOON"]`        |
| `fuelTypes`     | `[FuelType!]`     | Filter by fuel type(s)        | `["DIESEL", "ELECTRIC"]`   |
| `transmissions` | `[Transmission!]` | Filter by transmission        | `["AUTOMATIC"]`            |
| `priceMin`      | `Float`           | Minimum price (£)             | `20000`                    |
| `priceMax`      | `Float`           | Maximum price (£)             | `50000`                    |
| `mileageMin`    | `Int`             | Minimum mileage               | `5000`                     |
| `mileageMax`    | `Int`             | Maximum mileage               | `30000`                    |
| `yearMin`       | `Int`             | Earliest registration year    | `2021`                     |
| `yearMax`       | `Int`             | Latest registration year      | `2024`                     |
| `powerMin`      | `Int`             | Minimum power (bhp)           | `150`                      |
| `powerMax`      | `Int`             | Maximum power (bhp)           | `300`                      |
| `dealerIds`     | `[String!]`       | Filter by dealer number(s)    | `["12237", "16269"]`       |
| `sort`          | `SortField`       | Sort order                    | `"PRICE_ASC"`              |
| `page`          | `Int`             | Page number (1-based)         | `1`                        |
| `pageSize`      | `Int`             | Results per page (default 23) | `12`                       |

> **Sorting works cross-page.** Results are sorted by the BMW upstream API using native sort parameters (`sort=-cash_price`, `sort=cash_price`, `sort=-registration_date`, etc.). Page 1's last result will always be ≤ Page 2's first result (for ascending sorts). No client-side sort is applied.

> **Note on `dealerIds`:** When dealer IDs are provided, the backend triggers a full inventory index scan (~543 pages, cached for 1 hour). The first call may take 30-60 seconds; subsequent calls use the cache. Client-side filtering (series, fuelType, bodyType, price, mileage) and sorting are applied after the dealer filter.

**Enum values:**

```
BodyType:      ESTATE | SALOON | SUV | COUPE | HATCH | CONVERTIBLE
FuelType:      PETROL | DIESEL | ELECTRIC | PETROL_PLUG_IN_HYBRID | DIESEL_PLUG_IN_HYBRID
Transmission:  AUTOMATIC | MANUAL
Drivetrain:    RWD | FWD | AWD | XDRIVE
SortField:     PRICE_ASC | PRICE_DESC | MILEAGE_ASC | MILEAGE_DESC | AGE_NEWEST | AGE_OLDEST
```

**BMW upstream sort mapping (for reference):**

```
PRICE_ASC    → sort=cash_price
PRICE_DESC   → sort=-cash_price
MILEAGE_ASC  → sort=mileage
MILEAGE_DESC → sort=-mileage
AGE_NEWEST   → sort=-registration_date
AGE_OLDEST   → sort=registration_date
```

**Example — Diesel 3 Series under £30k, cheapest first:**

```json
{
  "input": {
    "series": ["3 Series"],
    "fuelTypes": ["DIESEL"],
    "priceMax": 30000,
    "sort": "PRICE_ASC",
    "page": 1,
    "pageSize": 12
  }
}
```

**Example response (truncated):**

```json
{
  "data": {
    "searchUsedVehicles": {
      "totalCount": 234,
      "totalPages": 20,
      "page": 1,
      "pageSize": 12,
      "vehicles": [
        {
          "id": "202601219323393",
          "vin": "WBA8M510605K44568",
          "series": "BMW 3 Series",
          "model": "335d xDrive M Sport Saloon",
          "brand": "BMW",
          "bodyType": "SALOON",
          "condition": "APPROVED_USED",
          "price": 17990,
          "financeAvailable": true,
          "registrationDate": "2019-06-28",
          "mileage": 63480,
          "fuelType": "DIESEL",
          "transmission": "AUTOMATIC",
          "colour": null,
          "insuranceGroup": "42E",
          "electricRange": null,
          "mpgCombined": 40.9,
          "co2Emissions": 158,
          "images": [
            {
              "url": "https://m.atcdn.co.uk/a/media/w800/...",
              "alt": "335d xDrive M Sport Saloon - image 1",
              "order": 1
            }
          ],
          "standardFeatures": [
            "M Sport Exterior Styling",
            "Heated front seats",
            "..."
          ],
          "optionalPacks": ["M Sport Pro Pack", "Technology Pack"],
          "dealer": {
            "id": "582",
            "name": "Sytner Sheffield",
            "phone": "01234 567890"
          }
        }
      ],
      "facets": {
        "series": [
          { "value": "BMW i", "count": 0 },
          { "value": "1 Series", "count": 0 }
        ],
        "fuelTypes": [
          { "value": "ELECTRIC", "count": 0 },
          { "value": "DIESEL", "count": 0 }
        ],
        "priceRange": { "min": 5000, "max": 150000 },
        "mileageRange": { "min": 0, "max": 200000 }
      }
    }
  }
}
```

---

### 3. `usedVehicle` — Get Vehicle by ID

Fetches a single vehicle by its advert ID. Calls the BMW detail endpoint directly (`GET /vehicle/api/?advert_id=X`) and returns rich data including colour, drivetrain, performance specs, and full dealer address with lat/lng.

```graphql
query GetVehicle($id: ID!) {
  usedVehicle(id: $id) {
    id
    vin
    series
    model
    price
    bodyType
    fuelType
    transmission
    drivetrain # XDRIVE, RWD, FWD, AWD
    colour # e.g. "Skyscraper Grey metallic"
    upholstery # e.g. "Black Vernasca Leather"
    mileage
    registrationDate
    registrationNumber
    power # HP (e.g. 347)
    torque # Nm (e.g. 700)
    acceleration # 0-62 in seconds (e.g. 5.9)
    topSpeed # MPH (e.g. 152)
    co2Emissions
    mpgCombined
    mpgUrban
    mpgExtraUrban
    electricRange
    electricRangeCity
    energyConsumption
    insuranceGroup
    financeAvailable
    length # mm (e.g. 5181)
    width # mm (e.g. 2020)
    height # mm (e.g. 1835)
    weight # kg (e.g. 2510)
    bootVolume # litres (e.g. 750)
    images {
      url
      alt
      order
    }
    standardFeatures
    optionalPacks
    dealer {
      id
      name
      address
      postcode
      phone
      latitude
      longitude # GPS coordinates
    }
  }
}
```

**Note:** This endpoint now calls the BMW detail API directly — no cache dependency on prior searches.

---

### 4. `usedVehicleByVin` — Get Vehicle by VIN

Same as above but looks up by VIN number.

```graphql
query GetByVin($vin: String!) {
  usedVehicleByVin(vin: $vin) {
    id
    series
    model
    price
    # ... same fields as usedVehicle
  }
}
```

---

### 5. `usedVehicleFilters` — Get Available Filters

Returns available filter values for building UI filter panels. Useful for populating dropdown/checkbox filter groups.

```graphql
query {
  usedVehicleFilters {
    series {
      value
      count
    }
    bodyTypes {
      value
      count
    }
    fuelTypes {
      value
      count
    }
    transmissions {
      value
      count
    }
    colours {
      value
      count
    }
    priceRange {
      min
      max
    }
    mileageRange {
      min
      max
    }
    yearRange {
      min
      max
    }
  }
}
```

---

### 6. `usedVehicleDealers` — List All Dealers

Returns all BMW approved used car dealers sorted by inventory size (largest first). Use this for dealer picker dropdowns or map views. Triggers a full index scan on first call (~30-60s), then cached for 1 hour.

```graphql
query {
  usedVehicleDealers {
    dealerNumber # e.g. "12237"
    dealerName # e.g. "Sytner Sheffield"
    vehicleCount # e.g. 38
  }
}
```

**Example response:**

```json
{
  "data": {
    "usedVehicleDealers": [
      {
        "dealerNumber": "12237",
        "dealerName": "Sytner Sheffield",
        "vehicleCount": 38
      },
      {
        "dealerNumber": "16269",
        "dealerName": "Ocean Plymouth",
        "vehicleCount": 36
      },
      {
        "dealerNumber": "16229",
        "dealerName": "Stratstone Leeds",
        "vehicleCount": 35
      }
    ]
  }
}
```

**Usage:** Pass `dealerNumber` values as `dealerIds` in `searchUsedVehicles` to filter by dealer.

---

### 7. `compareVehicles` — Fast Vehicle Specs Comparison

Fetches full detail for up to 3 vehicles. **No AI involved** — returns immediately (~1-2s). Use this to render the comparison table/cards while the AI summary loads.

```graphql
query CompareVehicles($ids: [ID!]!) {
  compareVehicles(ids: $ids) {
    vehicles {
      id
      model
      price
      mileage
      fuelType
      colour
      drivetrain
      power
      torque
      topSpeed
      acceleration
      co2Emissions
      bodyType
      registrationDate
      dealer {
        name
      }
    }
  }
}
```

**Variables:**

```json
{
  "ids": ["202406150775633", "202503049727321"]
}
```

**Example response:**

```json
{
  "data": {
    "compareVehicles": {
      "vehicles": [
        {
          "id": "202406150775633",
          "model": "X7 xDrive40d M Sport",
          "price": 66898,
          "mileage": 8225,
          "fuelType": "DIESEL",
          "colour": "Skyscraper Grey metallic",
          "drivetrain": "XDRIVE",
          "power": 347,
          "torque": 700,
          "topSpeed": 152,
          "acceleration": 5.9,
          "co2Emissions": 222,
          "bodyType": "SUV",
          "registrationDate": "2023-10-31",
          "dealer": { "name": "Arnold Clark Inverness" }
        },
        {
          "id": "202503049727321",
          "model": "330e M Sport Saloon",
          "price": 41000,
          "mileage": 7755,
          "fuelType": "PETROL_PLUG_IN_HYBRID",
          "colour": "Black Sapphire metallic paint",
          "drivetrain": "RWD",
          "power": 288,
          "torque": 280,
          "topSpeed": 143,
          "acceleration": 5.9,
          "co2Emissions": 21,
          "bodyType": "SALOON",
          "registrationDate": "2025-01-07",
          "dealer": { "name": "Sytner Coventry" }
        }
      ]
    }
  }
}
```

---

### 8. `compareVehicleSummary` — AI-Powered Comparison Insights

Generates a structured AI comparison using WatsonX (Llama 3.3 70B). Returns **5 independent sections** so the frontend can render them separately — as cards, accordions, or progressive reveals. Takes ~4-8s due to AI inference.

```graphql
query CompareVehicleSummary($ids: [ID!]!, $tone: CompareTone) {
  compareVehicleSummary(ids: $ids, tone: $tone) {
    overview # Brief categorisation of the vehicles
    keyDifferences # Detailed spec/feature breakdown
    targetBuyer # Who each vehicle suits
    valueAssessment # Value-for-money analysis
    recommendation # Final pick with reasoning
  }
}
```

**Variables:**

| Variable | Type          | Required | Description                                                           |
| -------- | ------------- | -------- | --------------------------------------------------------------------- |
| `ids`    | `[ID!]!`      | Yes      | Array of 2–3 vehicle IDs to compare                                   |
| `tone`   | `CompareTone` | No       | Controls the writing style of the AI summary. Defaults to `LIFESTYLE` |

**`CompareTone` enum:**

| Value       | Description                                                                                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `LIFESTYLE` | Friendly, benefit-focused language aimed at everyday buyers (default)                                                                                                                                                                                        |
| `RUSSELL`   | 🏎️ Deep technical analysis — chassis codes, engine families (B48/S58/N55), gearbox variants (ZF 8HP), xDrive ratios, suspension geometry, drag coefficients, known failure modes, TSBs, and production-run differences. Written like an obsessive petrolhead |

**Example variables:**

```json
{
  "ids": ["202406150775633", "202503049727321"],
  "tone": "RUSSELL"
}
```

**Example response:**

```json
{
  "data": {
    "compareVehicleSummary": {
      "overview": "You're deciding between the BMW X7 xDrive40d M Sport, a large luxury SUV, and the 330e M Sport Saloon, a plug-in hybrid executive car. Both offer performance and features but cater to different needs.",
      "keyDifferences": "The X7 is a diesel SUV producing 347 hp and 700 Nm of torque with a top speed of 152 mph. The 330e is a plug-in hybrid with 288 hp and 280 Nm. The X7 has a larger boot (750 litres vs 375), but the 330e has dramatically lower CO2 (21 g/km vs 222) and 58 miles of electric range. The price gap is £25,898.",
      "targetBuyer": "The X7 suits families who need space, luxury, and towing capability. The 330e suits commuters and urban professionals who want low running costs, congestion charge exemption, and a sporty drive without the environmental guilt.",
      "valueAssessment": "The 330e offers significantly better value — it's £25,898 cheaper with much lower running costs thanks to plug-in hybrid efficiency. The X7 justifies its premium through sheer space, prestige, and versatility that the smaller saloon can't match.",
      "recommendation": "For most buyers, the 330e M Sport Saloon is the smarter purchase — excellent performance, minimal emissions, and a price that leaves room in the budget. Choose the X7 only if you genuinely need 7 seats or regular heavy-duty cargo capacity."
    }
  }
}
```

**Frontend UX pattern:** Fire both queries in parallel:

1. `compareVehicles` → render specs table immediately
2. `compareVehicleSummary` → show skeleton/loading cards, then slot in each section when it arrives

Each section field is independent — display all 5, or just the ones relevant to your UI (e.g., only `recommendation` in a compact view).

**Limits:** Maximum 3 vehicle IDs. If WatsonX is unavailable, each field returns a graceful fallback message.

---

### 9. `vehicleFinanceQuotes` — Get Finance Options for a Vehicle

Fetches all available finance quotes (PCP, HP, Cash) for a specific vehicle by calling the BMW quotes API. Returns real-time finance data powered by Codeweavers.

```graphql
query VehicleFinance($vehicleId: ID!) {
  vehicleFinanceQuotes(vehicleId: $vehicleId) {
    quoteId
    monthlyPayment
    apr
    term
    totalDeposit
    cashDeposit
    lenderContribution
    balance
    residualValue
    totalAmountPayable
    chargesForCredit
    annualMileage
    contractMileage
    excessMileageRate
    productName
    productKey
    vehiclePrice
    validFrom
    validTo
  }
}
```

**Variables:**

```json
{
  "vehicleId": "202601219323393"
}
```

**Example response:**

```json
{
  "data": {
    "vehicleFinanceQuotes": [
      {
        "quoteId": "CW-12345678",
        "monthlyPayment": 289.5,
        "apr": 6.9,
        "term": 48,
        "totalDeposit": 3598,
        "cashDeposit": 3598,
        "lenderContribution": null,
        "balance": 14392,
        "residualValue": 7195,
        "totalAmountPayable": 21498,
        "chargesForCredit": 3508,
        "annualMileage": 8000,
        "contractMileage": 32000,
        "excessMileageRate": 0.06,
        "productName": "Personal Contract Purchase (PCP)",
        "productKey": "PCP_USED",
        "vehiclePrice": 17990,
        "validFrom": "2026-05-14",
        "validTo": "2026-05-28"
      },
      {
        "quoteId": "CW-12345679",
        "monthlyPayment": 349.0,
        "apr": 6.9,
        "term": 48,
        "totalDeposit": 3598,
        "cashDeposit": 3598,
        "lenderContribution": null,
        "balance": 14392,
        "residualValue": 0,
        "totalAmountPayable": 20350,
        "chargesForCredit": 2360,
        "annualMileage": 8000,
        "contractMileage": 32000,
        "excessMileageRate": null,
        "productName": "Hire Purchase (HP)",
        "productKey": "HP_USED",
        "vehiclePrice": 17990,
        "validFrom": "2026-05-14",
        "validTo": "2026-05-28"
      }
    ]
  }
}
```

**Notes:**

- Calls the BMW quotes API under the hood (`/vehicle/api/quotes/`) — requires the vehicle to exist in BMW's inventory
- Typically returns 2-3 options: PCP, HP, and sometimes Cash
- Response times are ~2-4s (external API call to Codeweavers via BMW)
- `validFrom`/`validTo` indicate when the quote expires — display this to the user
- `excessMileageRate` is pence per mile (e.g. `0.06` = 6p/mile) — only applies to PCP

---

### 10. `financeQuote` — Get a Specific Finance Quote by ID

Retrieves a previously generated finance quote by its Codeweavers quote reference. Use this to reload a saved quote or link to a specific finance option.

```graphql
query GetQuote($quoteId: String!) {
  financeQuote(quoteId: $quoteId) {
    quoteId
    monthlyPayment
    apr
    term
    totalDeposit
    cashDeposit
    lenderContribution
    balance
    residualValue
    totalAmountPayable
    chargesForCredit
    annualMileage
    contractMileage
    excessMileageRate
    productName
    productKey
    vehiclePrice
    validFrom
    validTo
  }
}
```

**Variables:**

```json
{
  "quoteId": "CW-12345678"
}
```

**Notes:**

- Uses BMW Velocity token authentication → Codeweavers API
- Returns `null` if the quote has expired or doesn't exist

---

### 11. `myGarage` — Get Saved Vehicles

Returns a user's saved/shortlisted vehicles. Each vehicle is fetched live from the BMW detail API, so all fields (colour, specs, dealer) are fully populated.

```graphql
query MyGarage($userId: String!) {
  myGarage(userId: $userId) {
    id
    vin
    series
    model
    price
    mileage
    fuelType
    transmission
    bodyType
    registrationDate
    images {
      url
      alt
      order
    }
    dealer {
      id
      name
      phone
    }
  }
}
```

**Variables:**

```json
{
  "userId": "user-123"
}
```

**Example response:**

```json
{
  "data": {
    "myGarage": [
      {
        "id": "202601219323393",
        "vin": "WBA8M510605K44568",
        "series": "BMW 3 Series",
        "model": "335d xDrive M Sport Saloon",
        "price": 17990,
        "mileage": 63480,
        "fuelType": "DIESEL",
        "transmission": "AUTOMATIC",
        "bodyType": "SALOON",
        "registrationDate": "2019-06-28",
        "images": [
          {
            "url": "https://m.atcdn.co.uk/a/media/w800/...",
            "alt": "335d xDrive M Sport Saloon - image 1",
            "order": 1
          }
        ],
        "dealer": {
          "id": "582",
          "name": "Sytner Sheffield",
          "phone": "01234 567890"
        }
      }
    ]
  }
}
```

**Notes:**

- Returns full `UsedVehicle` objects (same type as `usedVehicle(id)` detail query)
- Vehicle IDs are stored in SQLite — the vehicle data itself is fetched live on each call
- If a vehicle has been removed from BMW's inventory, it will be excluded from the response
- Returns an empty array `[]` if the user has no saved vehicles

---

### 12. `garageVehicleIds` — Get Saved Vehicle IDs Only

Lightweight query that returns just the IDs of a user's saved vehicles (no detail fetches). Ideal for checking whether to show a "saved" heart icon on PLP cards.

```graphql
query GarageIds($userId: String!) {
  garageVehicleIds(userId: $userId)
}
```

**Variables:**

```json
{
  "userId": "user-123"
}
```

**Example response:**

```json
{
  "data": {
    "garageVehicleIds": [
      "202601219323393",
      "202601145871010",
      "202601087912376"
    ]
  }
}
```

**Notes:**

- Returns `[ID!]!` — always an array (empty if no saved vehicles)
- Much faster than `myGarage` since it skips BMW API detail calls
- Use this on PLP to mark which cards are already saved

---

## Mutations

### `addToGarage` — Save a Vehicle

Adds a vehicle to the user's saved garage/shortlist. Idempotent — adding a vehicle that's already saved is a no-op (returns `true`).

```graphql
mutation AddToGarage($userId: String!, $vehicleId: ID!) {
  addToGarage(userId: $userId, vehicleId: $vehicleId)
}
```

**Variables:**

```json
{
  "userId": "user-123",
  "vehicleId": "202601219323393"
}
```

**Response:**

```json
{
  "data": {
    "addToGarage": true
  }
}
```

---

### `removeFromGarage` — Remove a Saved Vehicle

Removes a vehicle from the user's garage/shortlist.

```graphql
mutation RemoveFromGarage($userId: String!, $vehicleId: ID!) {
  removeFromGarage(userId: $userId, vehicleId: $vehicleId)
}
```

**Variables:**

```json
{
  "userId": "user-123",
  "vehicleId": "202601219323393"
}
```

**Response:**

```json
{
  "data": {
    "removeFromGarage": true
  }
}
```

**Notes:**

- Returns `true` even if the vehicle wasn't in the garage (idempotent)
- No authentication enforcement — relies on the `userId` parameter

---

### `recalculateFinance` — Recalculate Finance with New Parameters

Takes an existing quote ID and recalculates with adjusted deposit, term, mileage, or product type. Use this for the interactive finance calculator on the vehicle detail page.

```graphql
mutation RecalcFinance($input: RecalculateFinanceInput!) {
  recalculateFinance(input: $input) {
    quoteId
    monthlyPayment
    apr
    term
    totalDeposit
    cashDeposit
    lenderContribution
    balance
    residualValue
    totalAmountPayable
    chargesForCredit
    annualMileage
    contractMileage
    excessMileageRate
    productName
    productKey
    vehiclePrice
    validFrom
    validTo
  }
}
```

**Variables — `RecalculateFinanceInput`:**

| Field           | Type      | Required | Description                                        |
| --------------- | --------- | -------- | -------------------------------------------------- |
| `quoteId`       | `String!` | Yes      | The `quoteId` from a previous finance quote        |
| `deposit`       | `Float`   | No       | New cash deposit amount (£)                        |
| `term`          | `Int`     | No       | New term in months (e.g. 24, 36, 48, 60)           |
| `annualMileage` | `Int`     | No       | New annual mileage (e.g. 6000, 8000, 10000, 15000) |
| `productKey`    | `String`  | No       | Switch product type: `"PCP_USED"` or `"HP_USED"`   |

**Example — Change deposit and term:**

```json
{
  "input": {
    "quoteId": "CW-12345678",
    "deposit": 5000,
    "term": 36
  }
}
```

**Example response:**

```json
{
  "data": {
    "recalculateFinance": {
      "quoteId": "CW-12345680",
      "monthlyPayment": 382.75,
      "apr": 6.9,
      "term": 36,
      "totalDeposit": 5000,
      "cashDeposit": 5000,
      "lenderContribution": null,
      "balance": 12990,
      "residualValue": 8395,
      "totalAmountPayable": 22779,
      "chargesForCredit": 4789,
      "annualMileage": 8000,
      "contractMileage": 24000,
      "excessMileageRate": 0.06,
      "productName": "Personal Contract Purchase (PCP)",
      "productKey": "PCP_USED",
      "vehiclePrice": 17990,
      "validFrom": "2026-05-14",
      "validTo": "2026-05-28"
    }
  }
}
```

**Notes:**

- Returns a **new** `quoteId` — the recalculated quote is a fresh reference
- Only include fields you want to change — omitted fields keep their original values
- Response time ~1-2s (Codeweavers recalculate endpoint)

---

### `submitVehicleEnquiry` — Submit a Vehicle Enquiry

Creates a local enquiry record (stored in SQLite). Use this on the vehicle detail page to capture customer interest.

```graphql
mutation SubmitEnquiry($input: VehicleEnquiryInput!) {
  submitVehicleEnquiry(input: $input) {
    id
    success
    message
  }
}
```

**Variables — `VehicleEnquiryInput`:**

| Field                      | Type            | Required | Description                          |
| -------------------------- | --------------- | -------- | ------------------------------------ |
| `vehicleId`                | `ID!`           | Yes      | The vehicle `id` from search results |
| `customerName`             | `String!`       | Yes      | Full name                            |
| `customerEmail`            | `String!`       | Yes      | Email address                        |
| `customerPhone`            | `String!`       | Yes      | Phone number                         |
| `message`                  | `String`        | No       | Free-text message                    |
| `preferredContactMethod`   | `ContactMethod` | No       | `PHONE`, `EMAIL`, or `WHATSAPP`      |
| `interestedInFinance`      | `Boolean`       | No       | Interested in finance options        |
| `interestedInPartExchange` | `Boolean`       | No       | Interested in part-exchange          |

**Example:**

```json
{
  "input": {
    "vehicleId": "202601219323393",
    "customerName": "John Smith",
    "customerEmail": "john@example.com",
    "customerPhone": "07700 900123",
    "message": "Is this car still available?",
    "preferredContactMethod": "EMAIL",
    "interestedInFinance": true
  }
}
```

**Response:**

```json
{
  "data": {
    "submitVehicleEnquiry": {
      "id": "a1b2c3d4-...",
      "success": true,
      "message": "Your enquiry has been submitted. A dealer will be in touch shortly."
    }
  }
}
```

---

## Complete `UsedVehicle` Type Reference

All fields available on a vehicle object:

| Field                     | Type                | Always present | Description                                                                          |
| ------------------------- | ------------------- | -------------- | ------------------------------------------------------------------------------------ |
| `id`                      | `ID!`               | Yes            | Unique advert ID (numeric string)                                                    |
| `vin`                     | `String!`           | Yes            | Vehicle Identification Number                                                        |
| `series`                  | `String!`           | Yes            | e.g. "BMW 3 Series", "BMW X5", "BMW i4"                                              |
| `model`                   | `String!`           | Yes            | e.g. "320d M Sport Saloon", "X5 xDrive40d M Sport"                                   |
| `brand`                   | `String!`           | Yes            | Always "BMW"                                                                         |
| `bodyType`                | `BodyType!`         | Yes            | Inferred: `ESTATE`, `SALOON`, `SUV`, `COUPE`, `HATCH`, `CONVERTIBLE`                 |
| `condition`               | `VehicleCondition!` | Yes            | Always `APPROVED_USED`                                                               |
| `price`                   | `Float!`            | Yes            | Cash price in GBP (£)                                                                |
| `estimatedMonthlyPayment` | `Float`             | Usually        | PCP estimate (10% deposit, 48mo, 6.9% APR, 40% residual). ~£256/mo for £17,990 car   |
| `financeAvailable`        | `Boolean!`          | Yes            | Whether online finance is available                                                  |
| `registrationDate`        | `String!`           | Yes            | ISO date `"2023-10-31"`                                                              |
| `registrationNumber`      | `String`            | Sometimes      | UK registration plate                                                                |
| `mileage`                 | `Int`               | Usually        | Odometer reading in miles                                                            |
| `fuelType`                | `FuelType!`         | Yes            | `PETROL`, `DIESEL`, `ELECTRIC`, `PETROL_PLUG_IN_HYBRID`, `DIESEL_PLUG_IN_HYBRID`     |
| `transmission`            | `Transmission!`     | Yes            | `AUTOMATIC` or `MANUAL`                                                              |
| `drivetrain`              | `Drivetrain`        | Detail only    | `RWD`, `FWD`, `AWD`, `XDRIVE`                                                        |
| `colour`                  | `String`            | Detail only    | e.g. `"Skyscraper Grey metallic"`                                                    |
| `upholstery`              | `String`            | Detail only    | e.g. `"Black Vernasca Leather"`                                                      |
| `power`                   | `Int`               | Sometimes      | HP/bhp from list or detail endpoint                                                  |
| `torque`                  | `Int`               | Detail only    | Nm, e.g. `700`                                                                       |
| `acceleration`            | `Float`             | Detail only    | 0-62 in seconds, e.g. `5.9`                                                          |
| `topSpeed`                | `Int`               | Detail only    | MPH, e.g. `152`                                                                      |
| `insuranceGroup`          | `String`            | Sometimes      | e.g. "42E"                                                                           |
| `electricRange`           | `Int`               | EV/PHEV only   | Total electric range in miles                                                        |
| `electricRangeCity`       | `Int`               | EV/PHEV only   | City electric range in miles                                                         |
| `energyConsumption`       | `String`            | EV/PHEV only   | e.g. "19.4 kWh/100km"                                                                |
| `mpgCombined`             | `Float`             | ICE/PHEV only  | Combined MPG                                                                         |
| `mpgUrban`                | `Float`             | ICE/PHEV only  | Urban MPG                                                                            |
| `mpgExtraUrban`           | `Float`             | ICE/PHEV only  | Extra-urban MPG                                                                      |
| `co2Emissions`            | `Int`               | ICE/PHEV only  | CO₂ in g/km                                                                          |
| `images`                  | `[VehicleImage!]!`  | Yes            | Array of `{ url, alt, order }`                                                       |
| `videoUrl`                | `String`            | Sometimes      | URL of video media if available                                                      |
| `badges`                  | `[String!]`         | Sometimes      | Auto-generated badges: "High specification", "Low mileage", "Nearly new", "Electric" |
| `standardFeatures`        | `[String!]`         | Yes            | List of standard equipment descriptions                                              |
| `optionalPacks`           | `[String!]`         | Yes            | List of optional package names                                                       |
| `dealerId`                | `ID!`               | Yes            | Dealer identifier                                                                    |
| `dealer`                  | `UsedCarDealer!`    | Yes            | `{ id, name, address, postcode, phone, latitude, longitude }`                        |
| `listedAt`                | `String`            | No             | Not available from source API                                                        |
| `updatedAt`               | `String`            | No             | Not available from source API                                                        |

---

## Frontend Implementation Notes

### Recommended Page Structure

1. **Landing / Series Picker** → `vehicleSeries` query
   - Display series cards with hero image, name, and count
   - Click a series → navigate to search with `series` filter pre-set

2. **Search Results** → `searchUsedVehicles` query
   - Left sidebar: filter panel built from `facets` in response + `usedVehicleFilters` for initial values
   - Main area: vehicle cards grid/list
   - Pagination: use `totalCount`, `totalPages`, `page`, `pageSize` to show page controls

3. **Vehicle Detail** → `usedVehicle(id)` query
   - Image gallery from `images` array (sorted by `order`)
   - Key facts: price, mileage, fuel type, transmission, drivetrain, registration date
   - Performance specs: power, torque, acceleration, top speed
   - Dimensions: length, width, height, weight, boot volume
   - Colour and upholstery
   - Features tabs: standard features + optional packs
   - Dealer info card with contact details + map (lat/lng available)
   - Finance calculator → `vehicleFinanceQuotes(vehicleId)` + `recalculateFinance` mutation
   - Enquiry form → `submitVehicleEnquiry` mutation

4. **Dealer Browser** → `usedVehicleDealers` + `searchUsedVehicles(input: { dealerIds })` queries
   - Dealer list/dropdown: fetch all dealers with `usedVehicleDealers`
   - Filter search by selected dealer(s) using `dealerIds` in search input

5. **Vehicle Comparison** → `compareVehicles(ids)` + `compareVehicleSummary(ids)` queries
   - Let users select 2-3 vehicles to compare
   - Fire both queries in parallel
   - Immediately render specs table/cards from `compareVehicles` response
   - Show skeleton loaders for AI insight cards
   - When `compareVehicleSummary` resolves, populate each section (overview, keyDifferences, targetBuyer, valueAssessment, recommendation)

6. **My Garage / Shortlist** → `myGarage` + `addToGarage` / `removeFromGarage`
   - Heart/save icon on vehicle cards → `addToGarage` mutation
   - Dedicated garage page → `myGarage(userId)` query to list saved vehicles
   - Remove button → `removeFromGarage` mutation
   - Garage vehicles return full detail (live from BMW API) — can link directly to vehicle detail page

### Pagination & Sorting

Default page size is 23 (matches BMW's own page size, upstream param `size=23`). You can override with `pageSize` in the input. Use `page` for pagination (1-based).

**Sorting is handled server-side by the BMW API** — results are globally sorted across all pages. The backend passes the correct BMW native `sort` parameter (e.g. `sort=-cash_price` for descending price). This means:

- Page 1 with `PRICE_ASC` contains the cheapest vehicles across the entire ~12,500 inventory
- Page 2 continues from where Page 1 left off (no overlap or gaps)
- No client-side re-sorting is needed on the frontend

```graphql
# Page 2, 12 results per page
searchUsedVehicles(input: { page: 2, pageSize: 12 }) { ... }
```

### Image URLs

All image URLs are ready to use — no transformation needed. They are typically 800px wide JPEGs from `atcdn.co.uk` or `autosonshow.tv`.

### Finance Calculator UX

The finance APIs support a full interactive calculator on the vehicle detail page:

1. **Initial load** → Call `vehicleFinanceQuotes(vehicleId)` when the detail page loads
   - Display the default PCP quote prominently (monthly payment, APR, term)
   - Show HP option as an alternative tab/toggle
   - Display key terms: deposit, total payable, residual value, excess mileage rate

2. **User adjusts parameters** → Call `recalculateFinance(input)` on slider/input change
   - Adjustable: deposit amount, term (24/36/48/60 months), annual mileage, product type
   - Debounce user input (300-500ms) before calling the API
   - Show loading state on the monthly payment while recalculating

3. **Quote expiry** → Display `validFrom`/`validTo` dates
   - Quotes typically valid for 14 days
   - Show "Quote expires on..." to create urgency

**`FinanceQuote` fields explained:**

| Field                | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `monthlyPayment`     | The regular monthly payment amount (£)                    |
| `apr`                | Annual Percentage Rate (representative)                   |
| `term`               | Contract length in months                                 |
| `totalDeposit`       | Total deposit (cash + any lender contribution)            |
| `cashDeposit`        | Customer's cash deposit portion                           |
| `lenderContribution` | Dealer/lender deposit contribution (if any)               |
| `balance`            | Amount financed after deposit                             |
| `residualValue`      | Final balloon payment (PCP only — £0 for HP)              |
| `totalAmountPayable` | Total cost over the full term                             |
| `chargesForCredit`   | Interest charges (total payable minus vehicle price)      |
| `annualMileage`      | Agreed annual mileage allowance                           |
| `contractMileage`    | Total mileage allowance over the contract                 |
| `excessMileageRate`  | Cost per excess mile in £ (PCP only, e.g. 0.06 = 6p/mile) |
| `productName`        | Human-readable product name                               |
| `productKey`         | API key: `"PCP_USED"` or `"HP_USED"`                      |

---

### Fields Available by Endpoint

**Search results** (`searchUsedVehicles`) return summary data — the following fields will be `null`:

- `colour`, `upholstery`, `drivetrain`
- `power`, `torque`, `acceleration`, `topSpeed`
- `length`, `width`, `height`, `weight`, `bootVolume`
- `listedAt`, `updatedAt`
- `chargingTime`, `batteryWarranty`

**Detail endpoint** (`usedVehicle(id)` and `compareVehicles`) calls the BMW detail API directly and **does** return:

- `colour`, `upholstery`, `drivetrain`
- `power`, `torque`, `acceleration`, `topSpeed`
- `length`, `width`, `height`, `weight`, `bootVolume`
- Full dealer address with `latitude`/`longitude`

Fields that are **never** available: `listedAt`, `updatedAt`, `chargingTime`, `batteryWarranty`.

### Error Handling

The API proxies to a live external service. Possible error scenarios:

- BMW API temporarily unavailable → GraphQL errors array will contain the message
- CSRF token refresh failure → retry after a few seconds
- Vehicle not found by ID → returns `null`

Wrap queries in try/catch and show appropriate loading/error states.

---

## Chat API

A streaming chat endpoint is also available for the AI assistant:

```
POST /api/chat/stream
Content-Type: application/json

{ "message": "I want a diesel BMW under £25k", "userId": "user-123" }
```

Returns a server-sent event stream with AI responses. The assistant can search vehicles and answer questions about the BMW used car inventory.
