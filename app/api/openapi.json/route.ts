import { NextResponse } from 'next/server'

// Discoverable OpenAPI 3.1 spec for SHOPIT's public API. Lets LLM agents and
// integrators auto-generate clients and understand the contract.
//
// Conventions followed (so MCP clients and LLM tool-callers find it):
//   - Served at /api/openapi.json (linked from llms.txt)
//   - Edge runtime, public, cacheable

export const runtime = 'edge'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shopit.onrender.com'

export async function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'SHOPIT API',
      version: '1.0.0',
      description:
        'Universal search across every Shopify merchant. Backed by Shopify Universal Commerce Protocol.',
      contact: { name: 'SHOPIT', url: SITE_URL },
      license: { name: 'MIT' },
    },
    servers: [{ url: SITE_URL, description: 'Production' }],
    paths: {
      '/api/ucp/search': {
        get: {
          operationId: 'searchCatalog',
          summary: 'Typeahead search across the global Shopify catalog',
          description:
            'Returns up to 10 slim products matching the query. Results are deduped and ranked. ' +
            "Use this for autocomplete-style flows or as a fast first-pass before deeper lookups.",
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              description: 'Free-text search query. Supports natural-language modifiers like "under $50".',
              schema: { type: 'string', minLength: 2, example: 'leather wallet under $80' },
            },
          ],
          responses: {
            '200': {
              description: 'A list of matching products',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      products: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/SlimProduct' },
                      },
                    },
                    required: ['products'],
                  },
                },
              },
            },
          },
        },
      },
      '/search': {
        get: {
          operationId: 'searchHtml',
          summary: 'HTML search results page (renders full grid with filters and sort)',
          description:
            'Server-rendered HTML page. Use the JSON-LD ItemList in the response head for programmatic ' +
            'access to a longer result set than /api/ucp/search returns.',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
            {
              name: 'country',
              in: 'query',
              description: 'ISO 3166-1 alpha-2 (US, CA, GB, AU, DE, FR, JP, IN)',
              schema: { type: 'string' },
            },
            {
              name: 'category',
              in: 'query',
              description: 'One of: Apparel, Footwear, Accessories, Beauty, Home, Electronics, Outdoor, Food & Drink, Toys',
              schema: { type: 'string' },
            },
            {
              name: 'sort',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['relevance', 'price-asc', 'price-desc', 'rating'],
                default: 'relevance',
              },
            },
          ],
          responses: { '200': { description: 'HTML page with Product/ItemList JSON-LD' } },
        },
      },
      '/products/{id}': {
        get: {
          operationId: 'productHtml',
          summary: 'Product detail page',
          description:
            'HTML page with full Product + Offer + AggregateRating + BreadcrumbList JSON-LD in head. ' +
            'The `id` is a Shopify UCP token, also returned as `slug` from /api/ucp/search.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Product page' },
            '404': { description: 'Product not found' },
          },
        },
      },
    },
    components: {
      schemas: {
        SlimProduct: {
          type: 'object',
          required: ['slug', 'title'],
          properties: {
            slug: { type: 'string', description: 'URL slug, also the UCP product id token.' },
            title: { type: 'string' },
            image: { type: ['string', 'null'], format: 'uri' },
            price: { $ref: '#/components/schemas/Money' },
            seller: { type: ['string', 'null'], description: 'Merchant name.' },
          },
        },
        Money: {
          type: ['object', 'null'],
          properties: {
            amount: { type: 'integer', description: 'Integer minor units (cents). 8999 → $89.99.' },
            currency: { type: 'string', description: 'ISO 4217 currency code.' },
          },
        },
      },
    },
  }

  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
