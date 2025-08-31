import {API_ENDPOINTS} from "@/constants";

export interface UploadResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    batchId: string;
    filename: string;
    startDate: string;
    totalDays: number;
    statistics: {
      createdProducts: number;
      updatedProducts: number;
      createdMetrics: number;
      updatedMetrics: number;
      totalRecords: number;
    };
  };
  details?: string[];
}

export async function uploadExcelFile(formData: FormData): Promise<UploadResult> {
  try {
    const response = await fetch(API_ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Upload failed',
        details: errorData.details
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Network error: ' + (error as Error).message
    };
  }
}