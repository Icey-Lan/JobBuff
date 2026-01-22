import { NextRequest, NextResponse } from 'next/server';

/**
 * PDF Parsing API Route using PP-StructureV3 via AIHubMix
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

export async function POST(request: NextRequest) {
    try {
        const body: ParsePdfRequest = await request.json();

        if (!body.file_base64) {
            return NextResponse.json(
                { success: false, error: 'Missing file_base64' },
                { status: 400 }
            );
        }

        if (!process.env.LLM_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'LLM_API_KEY not configured' },
                { status: 500 }
            );
        }

        // Use the correct OCR endpoint for PP-StructureV3
        const ocrEndpoint = 'https://aihubmix.com/v1/qianfan/ocr';

        // Determine file type from filename
        const isPdf = body.file_name.toLowerCase().endsWith('.pdf');
        const mimeType = isPdf ? 'application/pdf' : 'image/png';

        // Call PP-StructureV3 via AIHubMix OCR endpoint
        const response = await fetch(ocrEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'pp-structurev3',
                file: `data:${mimeType};base64,${body.file_base64}`,
                fileType: isPdf ? 0 : 1, // 0 = PDF, 1 = image
                useDocOrientationClassify: false,
                useDocUnwarping: false,
                useTextlineOrientation: false,
                useChartRecognition: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('PP-StructureV3 API error:', errorData);
            return NextResponse.json(
                {
                    success: false,
                    error: errorData.error?.message || errorData.message || `API error: ${response.status}`
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        // PP-StructureV3 returns structured data, extract markdown or text
        let markdown = '';

        if (data.result?.markdown) {
            markdown = data.result.markdown;
        } else if (data.result?.text) {
            markdown = data.result.text;
        } else if (data.markdown) {
            markdown = data.markdown;
        } else if (typeof data.result === 'string') {
            markdown = data.result;
        } else if (data.results && Array.isArray(data.results)) {
            // Handle array of results (multi-page)
            markdown = data.results.map((r: any) => r.markdown || r.text || JSON.stringify(r)).join('\n\n---\n\n');
        } else {
            // Fallback: stringify the entire response
            markdown = JSON.stringify(data, null, 2);
        }

        if (!markdown) {
            return NextResponse.json(
                { success: false, error: 'No content returned from parser' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            markdown: markdown,
            page_count: data.pageCount || data.result?.pageCount || 1,
        });

    } catch (error) {
        console.error('Error in parse-pdf:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}
