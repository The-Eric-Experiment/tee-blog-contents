import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import fmModule from "front-matter";
import type { FrontMatterResult } from "front-matter";
const fm = fmModule as unknown as <T>(content: string) => FrontMatterResult<T>;
import ejs from "ejs";
import z from "zod";
import { DateTime, Duration } from "luxon";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Constants
const FLIGHTS_CSV_PATH = path.join(
  __dirname,
  "../../pages/about-me/flights/flights.csv",
);
const AIRFRAMES_DIR = path.join(
  __dirname,
  "../../pages/about-me/flights/airframes",
);
const FLIGHTS_DIR = path.join(__dirname, "../../pages/about-me/flights");
const OUTPUT_DIR = path.join(__dirname, "../../pages/about-me");
const TEMPLATES_DIR = path.join(
  __dirname,
  "../templates/pages/about-me/flights",
);

type FlightContentData = {};

type FlightsCsvRow = {
  From: string;
  To: string;
  Date: string;
  Airline: string;
  "Flight Number": string;
  "Tail Number": string;
  "Aircraft Type": string;
  "Scheduled Departure": string;
  "Actual Departure": string;
  "Scheduled Arrival": string;
  "Actual Arrival": string;
  "Departure Delay": string;
  "Arrival Delay": string;
  "Flight Duration": string;
  "Terminal From": string;
  "Gate From": string;
  "Terminal To": string;
  "Gate To": string;
  Baggage: string;
  Status: string;
};

type FlightsJsonRow = {
  airline: string;
  from: string;
  to: string;
  date: string;
  flightNumber: string | null;
  tailNumber: string | null;
  aircraftType: string;
  scheduledDeparture: string | null;
  actualDeparture: string | null;
  scheduledArrival: string | null;
  actualArrival: string | null;
  departureDelay: string | null;
  arrivalDelay: string | null;
  flightDuration: string;
  terminalFrom: string | null;
  gateFrom: string | null;
  terminalTo: string | null;
  gateTo: string | null;
  baggage: string | null;
  status: string;
};

const flightJsonSchema = z
  .object({
    airline: z.string(),
    from: z.string(),
    to: z.string(),
    date: z.string(),
    flightNumber: z.string().nullable(),
    tailNumber: z.string().nullable(),
    aircraftType: z.string(),
    scheduledDeparture: z.string().nullable(),
    actualDeparture: z.string().nullable(),
    scheduledArrival: z.string().nullable(),
    actualArrival: z.string().nullable(),
    departureDelay: z.string().nullable(),
    arrivalDelay: z.string().nullable(),
    flightDuration: z.string(),
    terminalFrom: z.string().nullable(),
    gateFrom: z.string().nullable(),
    terminalTo: z.string().nullable(),
    gateTo: z.string().nullable(),
    baggage: z.string().nullable(),
    status: z.string(),
  })
  .strict() satisfies z.ZodType<FlightsJsonRow>;

interface OperatorHistoryEntry {
  reg?: string;
  "aircraft-type"?: string;
  airline: string;
  delivered: string;
  config?: string;
  engines?: string;
  "hex-code"?: string | number;
  name?: string;
  remarks?: string[];
}

const operatorHistoryEntrySchema = z
  .object({
    reg: z.string().optional(),
    "aircraft-type": z.string().optional(),
    airline: z.string(),
    delivered: z.string(),
    config: z.string().optional(),
    engines: z.string().optional(),
    "hex-code": z.union([z.string(), z.number()]).optional(),
    name: z.string().optional(),
    remarks: z.array(z.string()).optional(),
  })
  .strict() satisfies z.ZodType<OperatorHistoryEntry>;

interface AirframeInfo {
  "data-from"?: string;
  "aircraft-type"?: string;
  age?: string;
  "production-site"?: string;
  "airframe-status"?: string;
  "operator-history"?: OperatorHistoryEntry[];
}

const airframeInfoSchema = z
  .object({
    "data-from": z.string().optional(),
    "aircraft-type": z.string().optional(),
    age: z.string().optional(),
    "production-site": z.string().optional(),
    "airframe-status": z.string().optional(),
    "operator-history": z.array(operatorHistoryEntrySchema).optional(),
  })
  .strict();

type FlightOutput = FlightsJsonRow & {
  airline?: string;
  aircraft: string;
  airframeStatus: string;
  formattedDate: string;
  aircraftName?: string;
  engines?: string;
  airframeMd?: string;
  flightMd?: string;
  flightKey: string;
};

const flightOutputSchema = flightJsonSchema
  .extend({
    airline: z.string().optional(),
    aircraft: z.string(),
    airframeStatus: z.string(),
    formattedDate: z.string(),
    aircraftName: z.string().optional(),
    engines: z.string().optional(),
    airframeMd: z.string().optional(),
    flightMd: z.string().optional(),
    flightKey: z.string(),
  })
  .strict();

function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

function parseFlightDuration(durationStr: string): Duration {
  if (!durationStr || durationStr === "-") {
    return Duration.fromObject({ hours: 0, minutes: 0 });
  }

  const match = durationStr.match(/(?:(\d+)h)?\s?(?:(\d+)m)?/);

  const hours = match?.[1] ? parseInt(match[1] ?? "0") : 0;
  const minutes = match?.[2] ? parseInt(match[2] ?? "0") : 0;
  return Duration.fromObject({ hours, minutes });
}

/**
 * Parse date from CSV format (YYYY-MM-DD) or info.md format (DD MMM YYYY)
 */
function parseDate(dateStr: string): DateTime | null {
  if (!dateStr) return null;

  // Try CSV format first (YYYY-MM-DD)
  let date = DateTime.fromFormat(dateStr, "yyyy-MM-dd", { zone: "utc" });
  if (date.isValid) {
    return date;
  }

  // Try info.md format (DD MMM YYYY, e.g., "13 Jan 2011")
  date = DateTime.fromFormat(dateStr, "d MMM yyyy", { zone: "utc" });
  if (date.isValid) {
    return date;
  }

  // Try info.md format (MMM yyyy, e.g., "Jan 2011")
  date = DateTime.fromFormat(dateStr, "MMM yyyy", { zone: "utc" });
  if (date.isValid) {
    return date;
  }

  return null;
}

/**
 * Format date to info.md style: "13 Jan 2011"
 */
function formatDate(date: DateTime | null): string {
  if (!date || !date.isValid) {
    return "";
  }
  return date.toFormat("d MMM yyyy");
}

/**
 * Extract airport/city code from "City (CODE)" or slugify the string
 */
function slugForRoute(route: string | null | undefined): string {
  if (!route || route === "-") return "";
  const codeMatch = route.match(/\(([A-Z0-9]+)\)/);
  if (codeMatch) return codeMatch[1].toUpperCase();
  return (
    route
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6) || "X"
  );
}

/**
 * Compute a stable flight key from date, from, to, flight number.
 * Used to find the flight markdown at flights/<flightKey>/info.md.
 */
function getFlightKeyBase(flight: FlightsJsonRow): string {
  const date = flight.date && flight.date !== "-" ? flight.date : "0000-00-00";
  const fromPart = slugForRoute(flight.from) || "FROM";
  const toPart = slugForRoute(flight.to) || "TO";
  const fn = (flight.flightNumber ?? "").replace(/\s+/g, "") || "FL";
  return `${date}_${fromPart}_${toPart}_${fn}`;
}

/**
 * Load airframe info from info.md file
 */
function loadAirframeInfo(tailNumber: string | null): {
  info: AirframeInfo | null;
  md: string;
} {
  if (tailNumber === "VH-SKR") {
    debugger; //
  }
  if (!tailNumber || tailNumber === "-") {
    return { info: null, md: "" };
  }

  const infoPath = path.join(AIRFRAMES_DIR, tailNumber, "info.md");

  if (!fs.existsSync(infoPath)) {
    return { info: null, md: "" };
  }

  try {
    const content = fs.readFileSync(infoPath, "utf-8");
    const parsed = fm<AirframeInfo>(content);

    const validated = airframeInfoSchema.safeParse(parsed.attributes);
    if (!validated.success) {
      console.error(
        `Error validating airframe info schema for ${tailNumber}:`,
        parsed.attributes,
        validated.error,
      );
      process.exit(1);
    }

    return { info: parsed.attributes, md: parsed.body ?? "" };
  } catch (error) {
    console.error(`Error loading airframe info for ${tailNumber}:`, error);
    return { info: null, md: "" };
  }
}

/**
 * Load flight-specific content from flights/<flightKey>/info.md.
 * The body may include a regular [gallery] block and any markdown notes.
 */
function loadFlightContent(flightKey: string): string | null {
  const infoPath = path.join(FLIGHTS_DIR, flightKey, "info.md");
  if (!fs.existsSync(infoPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(infoPath, "utf-8");
    const parsed = fm<FlightContentData>(content);

    return (parsed.body ?? "").trim();
  } catch (error) {
    console.error(`Error loading flight content for ${flightKey}:`, error);
    return null;
  }
}

/**
 * Build enriched flights with flight markdown first, then airframe markdown.
 */
function buildEnrichedFlights(flights: FlightsJsonRow[]): FlightOutput[] {
  const keyCount = new Map<string, number>();

  return flights.map((flight) => {
    const baseKey = getFlightKeyBase(flight);
    const count = (keyCount.get(baseKey) ?? 0) + 1;
    keyCount.set(baseKey, count);
    const flightKey = count === 1 ? baseKey : `${baseKey}_${count}`;

    const flightDate = parseDate(flight.date);
    const formattedDate = formatDate(flightDate);

    const { info, md: airframeMd } = loadAirframeInfo(flight.tailNumber);

    let operatorHistory: OperatorHistoryEntry | null = null;
    if (info && info["operator-history"]) {
      operatorHistory = findMatchingOperatorHistory(
        info["operator-history"],
        flightDate,
      );
    }

    const flightBody = loadFlightContent(flightKey) ?? "";

    const getAircraftType = (): string => {
      const aircraftName = operatorHistory?.name;
      const tailNumber = flight.tailNumber && `(${flight.tailNumber})`;
      const aircraftType =
        operatorHistory?.["aircraft-type"] ??
        info?.["aircraft-type"] ??
        flight.aircraftType;

      const parts = [aircraftName, tailNumber, aircraftType].filter(Boolean);
      return parts.join(" ").trim() || "-";
    };

    const enriched: FlightOutput = {
      ...flight,
      flightKey,
      formattedDate,
      aircraft: getAircraftType(),
      airline: operatorHistory?.airline ?? flight.airline ?? "-",
      date: flight.date,
      flightDuration: flight.flightDuration ?? " - ",
      from: flight.from,
      to: flight.to,
      airframeMd: airframeMd.trim(),
      flightMd: flightBody.trim(),
      flightNumber: flight.flightNumber ?? "-",
      tailNumber: flight.tailNumber ?? "-",
      airframeStatus: info?.["airframe-status"] ?? "-",
      aircraftName: operatorHistory?.name ?? "-",
      engines: operatorHistory?.engines ?? "-",
      aircraftType:
        operatorHistory?.["aircraft-type"] ?? info?.["aircraft-type"] ?? "-",
    };

    const parsed = flightOutputSchema.safeParse(enriched);
    if (!parsed.success) {
      console.error(
        `Error validating enriched flight for ${flightKey}:`,
        enriched,
        parsed.error,
      );
      process.exit(1);
    }

    return enriched;
  });
}

/**
 * Find the operator history entry with the latest delivered date before the flight date
 */
function findMatchingOperatorHistory(
  operatorHistory: OperatorHistoryEntry[] | undefined,
  flightDate: DateTime | null,
): OperatorHistoryEntry | null {
  if (!operatorHistory || !operatorHistory.length || !flightDate) {
    return null;
  }

  let bestMatch: OperatorHistoryEntry | null = null;
  let bestDate: DateTime | null = null;

  for (const entry of operatorHistory) {
    if (!entry.delivered) continue;

    const deliveredDate = parseDate(entry.delivered);
    if (!deliveredDate || !deliveredDate.isValid) continue;

    // Must be before or equal to flight date
    if (deliveredDate <= flightDate) {
      // Keep the latest one
      if (!bestDate || deliveredDate > bestDate) {
        bestDate = deliveredDate;
        bestMatch = entry;
      }
    }
  }

  return bestMatch;
}

/**
 * Read flights from CSV
 */
async function getFlights(): Promise<FlightsJsonRow[]> {
  return new Promise((resolve, reject) => {
    const rows: FlightsJsonRow[] = [];

    fs.createReadStream(FLIGHTS_CSV_PATH)
      .pipe(
        csv
          .parse<FlightsCsvRow, FlightsJsonRow>({ headers: true })
          .transform((data: FlightsCsvRow): FlightsJsonRow => {
            const transformed: any = {};
            for (const [key, value] of Object.entries(data)) {
              transformed[toCamelCase(key)] = value === "-" ? null : value;
            }

            const parsed = flightJsonSchema.safeParse(transformed);
            if (!parsed.success) {
              console.error(
                "Validation error for row:",
                transformed,
                parsed.error,
              );
              process.exit(1);
            }

            return parsed.data;
          }),
      )
      .on("data", (row: FlightsJsonRow) => {
        rows.push(row);
      })
      .on("end", () => {
        resolve(rows);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * Generate paginated flight pages
 */
function generateFlightPages(flights: FlightOutput[]): void {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Ensure templates directory exists
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }

  // Load templates
  const flightTemplatePath = path.join(TEMPLATES_DIR, "flight.md.ejs");
  const flightsTemplatePath = path.join(TEMPLATES_DIR, "flights.md.ejs");
  const flightsMoreTemplatePath = path.join(
    TEMPLATES_DIR,
    "flights-more.md.ejs",
  );

  if (!fs.existsSync(flightTemplatePath)) {
    throw new Error(`Flight template not found: ${flightTemplatePath}`);
  }
  if (!fs.existsSync(flightsTemplatePath)) {
    throw new Error(`Flights template not found: ${flightsTemplatePath}`);
  }
  if (!fs.existsSync(flightsMoreTemplatePath)) {
    throw new Error(
      `Flights-more template not found: ${flightsMoreTemplatePath}`,
    );
  }

  const flightTemplate = fs.readFileSync(flightTemplatePath, "utf-8");
  const flightsTemplate = fs.readFileSync(flightsTemplatePath, "utf-8");
  const flightsMoreTemplate = fs.readFileSync(flightsMoreTemplatePath, "utf-8");

  // Create include function for EJS templates
  const createIncludeFunction = (baseDir: string) => {
    return (filename: string, data: any) => {
      const includePath = path.join(baseDir, filename);
      if (!fs.existsSync(includePath)) {
        throw new Error(`Include file not found: ${includePath}`);
      }
      const includeTemplate = fs.readFileSync(includePath, "utf-8");
      return ejs.render(includeTemplate, {
        ...data,
        include: createIncludeFunction(baseDir),
      });
    };
  };

  const include = createIncludeFunction(TEMPLATES_DIR);

  // Generate first page (10 flights)
  const firstPageFlights = flights.slice(0, 10);
  const hasMore = flights.length > 10;

  const totalFlights = flights.length;
  const knownAirframes = new Map<string, boolean>();
  for (const flight of flights) {
    if (flight.tailNumber) {
      knownAirframes.set(flight.tailNumber, true);
    }
  }
  const totalKnownAirframes = knownAirframes.size;
  const totalUnknownAirframes = flights.filter(
    (flight) => !flight.tailNumber || flight.tailNumber === "-",
  ).length;

  const totalFlightDuration = flights.reduce((acc, flight) => {
    const duration = parseFlightDuration(flight.flightDuration);

    return acc.plus(duration);
  }, Duration.fromMillis(0));

  const totalFlightTime = totalFlightDuration.toFormat("dd'd' h'h' m'm'");

  const totalAirlines = flights.reduce((acc, flight) => {
    return acc.add(flight.airline);
  }, new Set<string>()).size;

  const firstPageContent = ejs.render(flightsTemplate, {
    totalFlights,
    totalKnownAirframes,
    totalUnknownAirframes,
    totalFlightTime,
    totalAirlines,
    flights: firstPageFlights,
    flightTemplate,
    include,
    hasMore,
    nextPage: hasMore ? "flights-2" : null,
    currentPage: 1,
    totalPages: Math.ceil((flights.length - 10) / 20) + 1,
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, "flights.md"), firstPageContent);

  // Generate subsequent pages (20 flights each)
  let pageNum = 2;
  let offset = 10;

  while (offset < flights.length) {
    const pageFlights = flights.slice(offset, offset + 20);
    const hasNext = offset + 20 < flights.length;

    const pageContent = ejs.render(flightsMoreTemplate, {
      flights: pageFlights,
      flightTemplate: flightTemplate,
      include: include,
      hasNext,
      hasPrev: true,
      nextPage: hasNext ? `flights-${pageNum + 1}` : null,
      prevPage: pageNum === 2 ? "flights" : `flights-${pageNum - 1}`,
      currentPage: pageNum,
      totalPages: Math.ceil((flights.length - 10) / 20) + 1,
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `flights-${pageNum}.md`),
      pageContent,
    );

    offset += 20;
    pageNum++;
  }

  console.log(`Generated ${pageNum - 1} flight pages`);
}

/**
 * Main processing function
 */
export async function processFlights(): Promise<void> {
  console.log("Processing flights...");

  // Read flights from CSV
  const flights = await getFlights();
  console.log(`Loaded ${flights.length} flights from CSV`);

  // Assemble enriched flights: flight markdown first, then airframe markdown
  const enrichedFlights = buildEnrichedFlights(flights);
  console.log(`Built ${enrichedFlights.length} enriched flights`);

  // We reverse the array because we want the most
  // recent flights to appear first in the generated pages
  const inverted = enrichedFlights.slice().reverse();

  // Generate pages
  generateFlightPages(inverted);

  console.log("Flight pages generated successfully!");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processFlights().catch(console.error);
}
