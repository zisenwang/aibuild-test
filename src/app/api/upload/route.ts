import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/utils';
import { handleApiError } from '@/lib/api/errors';
import {
  validateUploadRequest,
  parseExcelFile,
  createUploadBatch,
  processUploadData
} from '@/lib/api/upload';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  console.log(`[UPLOAD] Excel upload request from IP: ${clientIP}`);

  try {
    const formData = await request.formData();
    
    const { file, startDate, overwriteExisting } = await validateUploadRequest(formData);
    
    console.log(`[UPLOAD] Processing file: ${file.name}, Start Date: ${startDate.toISOString().split('T')[0]}, Overwrite: ${overwriteExisting}`);
    
    const { parseResult } = await parseExcelFile(file);
    
    console.log(`[UPLOAD] Successfully parsed ${parseResult.products.length} products with ${parseResult.totalDays} days`);
    
    const uploadBatch = await createUploadBatch(file.name);
    
    const result = await processUploadData(
      parseResult,
      startDate,
      uploadBatch.id,
      overwriteExisting
    );
    
    console.log(`[UPLOAD] Success - Created/Updated: ${result.createdProducts + result.updatedProducts} products, ${result.totalRecords} metrics`);
    
    return NextResponse.json({
      success: true,
      message: 'Excel file uploaded and processed successfully',
      data: {
        batchId: uploadBatch.id,
        filename: file.name,
        startDate: startDate.toISOString().split('T')[0],
        totalDays: parseResult.totalDays,
        statistics: result
      }
    });
    
  } catch (error) {
    return handleApiError(error, `UPLOAD - ${clientIP}`);
  }
}