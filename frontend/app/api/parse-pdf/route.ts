import { NextRequest } from 'next/server';
import { createErrorResponse, createSuccessResponse, enforceApiGuard } from '@/lib/api-guards';

/**
 * Document Parsing API Route using PP-StructureV3 via AIHubMix
 * Supports: PDF, DOCX, DOC, and image files
 * 
 * Official API endpoint: https://aihubmix.com/v1/qianfan/ocr
 * Required params:
 * - model: "pp-structurev3"
 * - file: URL or base64 data URI
 */

export interface ParsePdfRequest {
    file_base64: string;  // Base64 encoded PDF file
    file_name: string;    // Original filename
}

export interface ParsePdfResponse {
    success: boolean;
    markdown: string;
    page_count?: number;
    error?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const OCR_TIMEOUT_MS = 45_000;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
    const guard = await enforceApiGuard(request, 'ocr');
    if (!guard.ok) {
        return guard.response;
    }
    const { requestId } = guard.context;

    try {
        const body: ParsePdfRequest = await request.json();

        if (!body.file_base64?.trim()) {
            return createErrorResponse(requestId, 400, 'Missing file_base64');
        }

        if (!body.file_name?.trim()) {
            return createErrorResponse(requestId, 400, 'Missing file_name');
        }

        const estimatedBytes = Math.floor((body.file_base64.length * 3) / 4);
        if (estimatedBytes > MAX_FILE_SIZE_BYTES) {
            return createErrorResponse(requestId, 413, 'File too large');
        }

        if (!process.env.LLM_API_KEY) {
            return createErrorResponse(requestId, 500, 'Service temporarily unavailable');
        }

        const ocrEndpoint = 'https://aihubmix.com/v1/qianfan/ocr';

        const fileName = body.file_name.toLowerCase();
        const isPdf = fileName.endsWith('.pdf');
        const isDocx = fileName.endsWith('.docx');
        const isDoc = fileName.endsWith('.doc');
        const isImage =
            fileName.endsWith('.png') ||
            fileName.endsWith('.jpg') ||
            fileName.endsWith('.jpeg') ||
            fileName.endsWith('.webp');
        const isWord = isDocx || isDoc;

        if (!isPdf && !isWord && !isImage) {
            return createErrorResponse(requestId, 415, 'Unsupported file type');
        }

        let mimeType: string;
        let fileType: number;
        if (isPdf) {
            mimeType = 'application/pdf';
            fileType = 0;
        } else if (isDocx) {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            fileType = 0;
        } else if (isDoc) {
            mimeType = 'application/msword';
            fileType = 0;
        } else {
            if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
                mimeType = 'image/jpeg';
            } else if (fileName.endsWith('.webp')) {
                mimeType = 'image/webp';
            } else {
                mimeType = 'image/png';
            }
            fileType = 1;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS);
        let response: Response;
        try {
            response = await fetch(ocrEndpoint, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'pp-structurev3',
                    file: `data:${mimeType};base64,${body.file_base64}`,
                    fileType,
                    useDocOrientationClassify: false,
                    useDocUnwarping: isWord,
                    useTextlineOrientation: false,
                    useChartRecognition: false,
                }),
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error(`[${requestId}] PP-StructureV3 API error:`, response.status, errorData);
            return createErrorResponse(requestId, 502, 'OCR request failed');
        }

        const data: unknown = await response.json();
        const dataRecord = isRecord(data) ? data : {};

        let markdown = '';
        const result = dataRecord.result;

        if (isRecord(result) && typeof result.markdown === 'string') {
            markdown = result.markdown;
        } else if (isRecord(result) && typeof result.text === 'string') {
            markdown = result.text;
        } else if (typeof dataRecord.markdown === 'string') {
            markdown = dataRecord.markdown;
        } else if (typeof dataRecord.result === 'string') {
            markdown = dataRecord.result;
        } else if (Array.isArray(dataRecord.results)) {
            markdown = dataRecord.results.map((item) => {
                if (isRecord(item)) {
                    if (typeof item.markdown === 'string') return item.markdown;
                    if (typeof item.text === 'string') return item.text;
                }
                return JSON.stringify(item);
            }).join('\n\n---\n\n');
        } else {
            markdown = JSON.stringify(dataRecord, null, 2);
        }

        if (!markdown) {
            return createErrorResponse(requestId, 502, 'No content returned from parser');
        }

        const pageCount =
            typeof dataRecord.pageCount === 'number'
                ? dataRecord.pageCount
                : isRecord(result) && typeof result.pageCount === 'number'
                    ? result.pageCount
                    : 1;

        return createSuccessResponse(requestId, {
            success: true,
            markdown,
            page_count: pageCount,
        });

    } catch (error) {
        console.error(`[${requestId}] Error in parse-pdf:`, error);
        const isTimeout =
            error instanceof Error &&
            (error.name === 'AbortError' || error.message.includes('aborted'));

        if (isTimeout) {
            return createErrorResponse(requestId, 504, 'OCR request timeout');
        }

        return createErrorResponse(requestId, 500, 'Internal server error');
    }
}
