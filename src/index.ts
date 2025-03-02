import {FastifyReply, FastifyTypeProviderDefault} from "fastify";
import * as http from "http";
import * as fs from "fs";

const fastify = require('fastify')({ logger: true })
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

type Highlight = {
  author: string;
  chapter: string;
  text: string;
  title: string;
  note: string;
};

interface FastifyRequest {
  body: MoonReaderBodyRequest;
  headers: {
    'user-agent': string;
    'authorization': string;
    'content-length': string;  // Fixed the typo from 'content-lenght' to 'content-length'
  }
}

type MoonReaderBodyRequest = {
  highlights: Array<Highlight> | undefined;
};

type FastifyResponse = FastifyReply<
    http.Server,
    http.IncomingMessage,
    http.ServerResponse,
    // NOTE: RouteGeneric
    any,
    // NOTE: ContextConfig
    any,
    // NOTE: SchemaCompiler
    any,
    FastifyTypeProviderDefault
  >;

fastify.post('/', async (request: FastifyRequest, response: FastifyResponse) => {
  const { body } = request;
  const { highlights } = body;
  const { headers } = request;  // Add this line to extract headers from request

  if (!highlights) {
    return response.callNotFound();
  }

  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  for (const highlight of highlights) {
    const { author, chapter, note, text, title } = highlight;

    await db.run(`
      INSERT INTO highlights (
        author, title, chapter, text, note, highlightedAt,
        device_info, auth_token, content_length, request_timestamp
      ) 
      VALUES (
        :author, :title, :chapter, :text, :note, :highlightedAt,
        :device_info, :auth_token, :content_length, :request_timestamp
      )`, {
        ':author': author,
        ':title': title,
        ':chapter': chapter || '',
        ':text': text,
        ':note': note || '',
        ':highlightedAt': new Date().toISOString(),
        ':device_info': headers['user-agent'],
        ':auth_token': headers['authorization'],
        ':content_length': parseInt(headers['content-length']),
        ':request_timestamp': new Date().toISOString()
    });

    // Log the highlight to a file
    const logEntry = `[${new Date().toISOString()}] Author: ${author}, Title: ${title}, Chapter: ${chapter}, Text: ${text}, Note: ${note}\n`;
    fs.appendFileSync('highlights.log', logEntry);
  }

  return response.code(201);
});

// NOTE: Set this variable to false if you want to stop listening on all available IPv4 interfaces
//       https://www.fastify.io/docs/latest/Guides/Getting-Started/#your-first-server
const shouldListenAllIpv4 = false;
const basicFastifyListenOptions = {
  port: 3000,
  host: shouldListenAllIpv4 ? '0.0.0.0' : undefined,
};

const start = async () => {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`CREATE TABLE
    IF NOT EXISTS highlights (
        id              INTEGER PRIMARY KEY,
        author          TEXT,
        title           TEXT,
        chapter         TEXT,
        text            TEXT,
        note            TEXT,
        highlightedAt   TEXT,
        device_info     TEXT,
        auth_token      TEXT,
        content_length  INTEGER,
        request_timestamp TEXT
    )
  `);

  try {
    await fastify.listen(basicFastifyListenOptions);
  } catch (err) {
    fastify.log.error(err);

    process.exit(1);
  }
};

start()
  .then(() => console.log("\n 🌙 Moon+ Reader highlight server is up! \n"));