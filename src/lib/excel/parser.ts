import * as XLSX from 'xlsx';

interface ExcelRow {
  ID: string;
  'Product Name': string;
  'Opening Inventory': number;
  [key: string]: any; // Dynamic day columns
}

interface ParsedDayData {
  dayNumber: number;
  procurementQty: number;
  procurementPrice: number;
  salesQty: number;
  salesPrice: number;
}

interface ParsedProduct {
  sku: string;
  name: string;
  openingInventory: number;
  daysData: ParsedDayData[];
}

interface ExcelParseResult {
  products: ParsedProduct[];
  totalDays: number;
  errors: string[];
}

export class ExcelParser {
  /**
   * Parse Excel file buffer and extract products with dynamic day columns
   */
  static parseExcelBuffer(buffer: Buffer): ExcelParseResult {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
      
      if (jsonData.length === 0) {
        return { products: [], totalDays: 0, errors: ['Excel file is empty'] };
      }

      // Analyze column structure to find day patterns
      const columnAnalysis = this.analyzeColumns(Object.keys(jsonData[0]));
      
      if (columnAnalysis.errors.length > 0) {
        return { products: [], totalDays: 0, errors: columnAnalysis.errors };
      }

      // Parse each product row
      const products: ParsedProduct[] = [];
      const errors: string[] = [];

      jsonData.forEach((row, index) => {
        try {
          const parsedProduct = this.parseProductRow(row, columnAnalysis.dayColumns);
          products.push(parsedProduct);
        } catch (error) {
          errors.push(`Row ${index + 2}: ${(error as Error).message}`);
        }
      });

      return {
        products,
        totalDays: columnAnalysis.maxDay,
        errors
      };

    } catch (error) {
      return { 
        products: [], 
        totalDays: 0, 
        errors: [`Failed to parse Excel file: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Analyze Excel columns to find day patterns
   */
  private static analyzeColumns(columns: string[]) {
    const dayColumns = new Map<number, {
      procurementQty?: string;
      procurementPrice?: string;
      salesQty?: string;
      salesPrice?: string;
    }>();

    const errors: string[] = [];
    
    // Regex patterns for different column types
    const patterns = {
      procurementQty: /^Procurement Qty \(Day (\d+)\)$/i,
      procurementPrice: /^Procurement Price \(Day (\d+)\)$/i,
      salesQty: /^Sales Qty \(Day (\d+)\)$/i,
      salesPrice: /^Sales Price \(Day (\d+)\)$/i
    };

    // Scan all columns for day patterns
    columns.forEach(column => {
      Object.entries(patterns).forEach(([type, regex]) => {
        const match = column.match(regex);
        if (match) {
          const dayNumber = parseInt(match[1]);
          
          if (!dayColumns.has(dayNumber)) {
            dayColumns.set(dayNumber, {});
          }
          
          dayColumns.get(dayNumber)![type as keyof typeof patterns] = column;
        }
      });
    });

    // Validate that each day has all required columns
    const maxDay = Math.max(...Array.from(dayColumns.keys()), 0);
    
    for (let day = 1; day <= maxDay; day++) {
      const dayData = dayColumns.get(day);
      if (!dayData) {
        errors.push(`Missing all columns for Day ${day}`);
        continue;
      }

      // Check for missing columns
      const requiredColumns = ['procurementQty', 'procurementPrice', 'salesQty', 'salesPrice'];
      const missingColumns = requiredColumns.filter(col => !dayData[col as keyof typeof dayData]);
      
      if (missingColumns.length > 0) {
        errors.push(`Day ${day} is missing columns: ${missingColumns.join(', ')}`);
      }
    }

    return { dayColumns, maxDay, errors };
  }

  /**
   * Parse individual product row
   */
  private static parseProductRow(row: ExcelRow, dayColumns: Map<number, any>): ParsedProduct {
    // Extract basic product info
    const sku = String(row.ID || '').trim();
    const name = String(row['Product Name'] || '').trim();
    const openingInventory = this.parseNumber(row['Opening Inventory']);

    if (!sku) throw new Error('Product ID is required');
    if (!name) throw new Error('Product Name is required');
    if (openingInventory === null) throw new Error('Opening Inventory must be a number');

    // Parse day data
    const daysData: ParsedDayData[] = [];
    
    Array.from(dayColumns.keys()).sort((a, b) => a - b).forEach(dayNumber => {
      const dayColumnNames = dayColumns.get(dayNumber)!;
      
      const procurementQty = this.parseNumber(row[dayColumnNames.procurementQty!]) || 0;
      const procurementPrice = this.parseNumber(row[dayColumnNames.procurementPrice!]) || 0;
      const salesQty = this.parseNumber(row[dayColumnNames.salesQty!]) || 0;
      const salesPrice = this.parseNumber(row[dayColumnNames.salesPrice!]) || 0;

      daysData.push({
        dayNumber,
        procurementQty,
        procurementPrice,
        salesQty,
        salesPrice
      });
    });

    return {
      sku,
      name,
      openingInventory,
      daysData
    };
  }

  /**
   * Parse number from Excel cell (handles strings with $ and commas)
   */
  private static parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    // Convert to string and clean up
    const cleanValue = String(value)
      .replace(/[$,\s]/g, '') // Remove $, commas, spaces
      .trim();
    
    if (cleanValue === '') return null;
    
    const num = parseFloat(cleanValue);
    return isNaN(num) ? null : num;
  }

  /**
   * Convert parsed products to database format with actual dates
   */
  static convertToDatabaseFormat(
    products: ParsedProduct[], 
    startDate: Date,
    uploadBatchId: string
  ) {
    const databaseRecords: any[] = [];

    products.forEach(product => {
      product.daysData.forEach(day => {
        // Calculate actual date: startDate + (dayNumber - 1) days
        const actualDate = new Date(startDate);
        actualDate.setDate(startDate.getDate() + (day.dayNumber - 1));

        databaseRecords.push({
          sku: product.sku,
          name: product.name,
          date: actualDate,
          openingInventory: product.openingInventory,
          procurementQty: day.procurementQty,
          procurementUnitPrice: day.procurementPrice,
          salesQty: day.salesQty,
          salesUnitPrice: day.salesPrice,
          uploadBatchId
        });
      });
    });

    return databaseRecords;
  }
}