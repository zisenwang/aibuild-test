import { prisma } from '@/lib/database';
import { ExcelParser } from '@/lib/excel/parser';
import { ValidationError } from './errors';
import { z } from 'zod';

type DatabaseRecord = {
  sku: string;
  name: string;
  date: Date;
  openingInventory: number;
  procurementQty: number;
  procurementUnitPrice: number;
  salesQty: number;
  salesUnitPrice: number;
  uploadBatchId: string;
};

type ProductGroup = {
  sku: string;
  name: string;
  metrics: DatabaseRecord[];
};

type PrismaTransaction = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

const uploadSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }),
  overwriteExisting: z.boolean().optional().default(false)
});

export interface ParsedFile {
  file: File;
  buffer: Buffer;
  parseResult: ReturnType<typeof ExcelParser.parseExcelBuffer>;
}

export interface UploadResult {
  createdProducts: number;
  updatedProducts: number;
  createdMetrics: number;
  updatedMetrics: number;
  totalRecords: number;
}

export async function validateUploadRequest(formData: FormData) {
  const file = formData.get('file') as File;
  const startDateStr = formData.get('startDate') as string;
  const overwriteExisting = formData.get('overwriteExisting') === 'true';

  if (!file) {
    throw new ValidationError('No file provided');
  }

  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    throw new ValidationError('File must be an Excel file (.xlsx or .xls)');
  }

  const validationResult = uploadSchema.safeParse({
    startDate: startDateStr,
    overwriteExisting
  });

  if (!validationResult.success) {
    throw new ValidationError('Invalid input parameters', validationResult.error.issues);
  }

  return {
    file,
    startDate: new Date(validationResult.data.startDate),
    overwriteExisting: validationResult.data.overwriteExisting
  };
}

export async function parseExcelFile(file: File): Promise<ParsedFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const parseResult = ExcelParser.parseExcelBuffer(buffer);

  if (parseResult.errors.length > 0) {
    throw new ValidationError('Excel parsing failed', parseResult.errors);
  }

  return { file, buffer, parseResult };
}

export async function createUploadBatch(filename: string) {
  return prisma.uploadBatch.create({
    data: {
      filename,
      uploadedBy: 'user' // TODO: Get from session when auth is implemented
    }
  });
}

export async function processUploadData(
  parseResult: ReturnType<typeof ExcelParser.parseExcelBuffer>,
  startDate: Date,
  uploadBatchId: string,
  overwriteExisting: boolean
): Promise<UploadResult> {
  const databaseRecords = ExcelParser.convertToDatabaseFormat(
    parseResult.products, 
    startDate, 
    uploadBatchId
  );

  return prisma.$transaction(async (tx) => {
    let createdProducts = 0;
    let updatedProducts = 0;
    let createdMetrics = 0;
    let updatedMetrics = 0;

    const productGroups = groupRecordsByProduct(databaseRecords);

    for (const productGroup of Object.values(productGroups)) {
      const productData = productGroup as ProductGroup;
      const productResult = await processProduct(tx, productData);

      if (productResult.isNew) {
        createdProducts++;
      } else {
        updatedProducts++;
      }

      const metricsResult = await processProductMetrics(
          tx,
          productResult.product,
          productData.metrics,
          uploadBatchId,
          overwriteExisting
      );

      createdMetrics += metricsResult.created;
      updatedMetrics += metricsResult.updated;
    }

    return {
      createdProducts,
      updatedProducts,
      createdMetrics,
      updatedMetrics,
      totalRecords: createdMetrics + updatedMetrics
    };
  });
}

function groupRecordsByProduct(databaseRecords: DatabaseRecord[]): Record<string, ProductGroup> {
  return databaseRecords.reduce((acc, record) => {
    if (!acc[record.sku]) {
      acc[record.sku] = {
        sku: record.sku,
        name: record.name,
        metrics: []
      };
    }
    acc[record.sku].metrics.push(record);
    return acc;
  }, {} as Record<string, ProductGroup>);
}

async function processProduct(tx: PrismaTransaction, productData: ProductGroup) {
  const existingProduct = await tx.product.findUnique({
    where: { sku: productData.sku }
  });

  const product = await tx.product.upsert({
    where: { sku: productData.sku },
    update: { name: productData.name },
    create: { 
      sku: productData.sku, 
      name: productData.name 
    }
  });

  return {
    product,
    isNew: !existingProduct
  };
}

async function processProductMetrics(
  tx: PrismaTransaction,
  product: { id: string },
  metrics: DatabaseRecord[],
  uploadBatchId: string,
  overwriteExisting: boolean
) {
  let created = 0;
  let updated = 0;

  for (const metricData of metrics) {
    if (overwriteExisting) {
      const result = await upsertMetric(tx, product.id, metricData, uploadBatchId);
      if (result.isNew) {
        created++;
      } else {
        updated++;
      }
    } else {
      await createMetric(tx, product.id, metricData, uploadBatchId);
      created++;
    }
  }

  return { created, updated };
}

async function upsertMetric(tx: PrismaTransaction, productId: string, metricData: DatabaseRecord, uploadBatchId: string) {
  const existingMetric = await tx.dailyMetric.findUnique({
    where: {
      productId_date: {
        productId,
        date: metricData.date
      }
    }
  });

  await tx.dailyMetric.upsert({
    where: {
      productId_date: {
        productId,
        date: metricData.date
      }
    },
    update: {
      openingInventory: metricData.openingInventory,
      procurementQty: metricData.procurementQty,
      procurementUnitPrice: metricData.procurementUnitPrice,
      salesQty: metricData.salesQty,
      salesUnitPrice: metricData.salesUnitPrice,
      uploadBatchId
    },
    create: {
      productId,
      date: metricData.date,
      openingInventory: metricData.openingInventory,
      procurementQty: metricData.procurementQty,
      procurementUnitPrice: metricData.procurementUnitPrice,
      salesQty: metricData.salesQty,
      salesUnitPrice: metricData.salesUnitPrice,
      uploadBatchId
    }
  });

  return { isNew: !existingMetric };
}

async function createMetric(tx: PrismaTransaction, productId: string, metricData: DatabaseRecord, uploadBatchId: string) {
  try {
    await tx.dailyMetric.create({
      data: {
        productId,
        date: metricData.date,
        openingInventory: metricData.openingInventory,
        procurementQty: metricData.procurementQty,
        procurementUnitPrice: metricData.procurementUnitPrice,
        salesQty: metricData.salesQty,
        salesUnitPrice: metricData.salesUnitPrice,
        uploadBatchId
      }
    });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2002') {
      throw new ValidationError(`Duplicate data found for product on ${metricData.date.toISOString().split('T')[0]}. Use overwrite option to update existing data.`);
    }
    throw error;
  }
}