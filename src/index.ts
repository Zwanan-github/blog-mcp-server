import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors"
import { config } from "dotenv";
import { getBlogByName, getBlogList } from "./tools/blogs";
import { z } from "zod";
import { networkInterfaces } from "os";
import { getLocalIP } from "./utils";

config()

const CORS_ORIGIN_URL = process.env.CORS_ORIGIN_URL || 'http://localhost:3000'

const app = express();
app.use(express.json());
app.use(cors({
  origin: [CORS_ORIGIN_URL],
  exposedHeaders: ['mcp-session-id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
}))

const server = new McpServer({
  name: "blog-mcp-server",
  version: "1.0.0"
});

server.tool(
  "list_blogs",
  "here lists all my blog note, help you to know what i do",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(await getBlogList())
        }
      ]
    }
  }
)

server.tool(
  "get_blog_content_by_id",
  "get my blog content by blog name",
  {
    name: z.string().describe("blog's name")
  },
  async ({name}) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(await getBlogByName(name))
        }
      ]
    }
  }
)

app.post('/mcp', async (req: Request, res: Response) => {
  // In stateless mode, create a new instance of transport and server for each request
  // to ensure complete isolation. A single instance would cause request ID collisions
  // when multiple clients connect concurrently.
  const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  try {
    res.on('close', () => {
      console.log('Request closed');
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

app.get('/mcp', async (req: Request, res: Response) => {
  console.log('Received GET MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});

app.delete('/mcp', async (req: Request, res: Response) => {
  console.log('Received DELETE MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});

app.listen(4000, () => {
  const ip = getLocalIP()
  console.log(`Server is running on http://${ip}:4000`);
});