import {
  processMedicineQuery,
  createAgentErrorResponse,
  AgentValidationError,
} from '../../../lib/agent-backend.ts';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    const errorResult = createAgentErrorResponse(
      new AgentValidationError(
        'Malformed JSON: Request body must be valid JSON.',
        'MALFORMED_JSON'
      )
    );
    return Response.json(errorResult.response, {
      status: errorResult.statusCode,
    });
  }

  try {
    const response = await processMedicineQuery(body);
    return Response.json(response, { status: 200 });
  } catch (error) {
    const errorResult = createAgentErrorResponse(error);
    return Response.json(errorResult.response, {
      status: errorResult.statusCode,
    });
  }
}

export async function GET(): Promise<Response> {
  return Response.json(
    {
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'The /api/medicine endpoint accepts POST requests only.',
      },
    },
    {
      status: 405,
      headers: { Allow: 'POST' },
    }
  );
}
