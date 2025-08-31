import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample data from your Excel format
const sampleData = [
  {
    sku: "0000001",
    name: "CHERRY 1PACK",
    openingInventory: 117,
    days: [
      { procurementQty: 0, procurementPrice: 0, salesQty: 22, salesPrice: 5.98 },
      { procurementQty: 21, procurementPrice: 13.72, salesQty: 12, salesPrice: 5.98 },
      { procurementQty: 0, procurementPrice: 0, salesQty: 7, salesPrice: 4.98 }
    ]
  },
  {
    sku: "0000002", 
    name: "ENOKI MUSHROOM 360G",
    openingInventory: 1020,
    days: [
      { procurementQty: 750, procurementPrice: 3.20, salesQty: 157, salesPrice: 4.38 },
      { procurementQty: 240, procurementPrice: 2.80, salesQty: 111, salesPrice: 4.38 },
      { procurementQty: 192, procurementPrice: 3.60, salesQty: 95, salesPrice: 4.38 }
    ]
  },
  {
    sku: "0000003",
    name: "JIN RAMEN HOT 5P", 
    openingInventory: 23,
    days: [
      { procurementQty: 720, procurementPrice: 7.00, salesQty: 23, salesPrice: 9.98 },
      { procurementQty: 0, procurementPrice: 7.00, salesQty: 20, salesPrice: 9.98 },
      { procurementQty: 360, procurementPrice: 7.60, salesQty: 15, salesPrice: 9.98 }
    ]
  },
  {
    sku: "0000004",
    name: "DRY TOFU 500G",
    openingInventory: 15,
    days: [
      { procurementQty: 10, procurementPrice: 7.40, salesQty: 34, salesPrice: 13.98 },
      { procurementQty: 20, procurementPrice: 7.40, salesQty: 9, salesPrice: 125.82 },
      { procurementQty: 30, procurementPrice: 7.40, salesQty: 26, salesPrice: 363.48 }
    ]
  },
  {
    sku: "0000005",
    name: "FREE RANGE EGGS 700G",
    openingInventory: 7,
    days: [
      { procurementQty: 45, procurementPrice: 12.14, salesQty: 10, salesPrice: 16.98 },
      { procurementQty: 45, procurementPrice: 12.66, salesQty: 9, salesPrice: 16.98 },
      { procurementQty: 60, procurementPrice: 10.14, salesQty: 6, salesPrice: 16.98 }
    ]
  }
];

async function seedSampleData() {
  try {
    console.log('🌱 Starting to seed sample data...');

    // Create a batch for tracking
    const batch = await prisma.uploadBatch.create({
      data: {
        filename: 'sample-data-seed.xlsx',
        uploadedBy: 'system-seed'
      }
    });

    let totalMetrics = 0;

    for (const item of sampleData) {
      console.log(`Processing ${item.sku} - ${item.name}...`);

      // Create or update product
      const product = await prisma.product.upsert({
        where: { sku: item.sku },
        update: { name: item.name },
        create: {
          sku: item.sku,
          name: item.name
        }
      });

      // Create daily metrics for 3 days
      const baseDate = new Date('2024-01-01'); // Start from Jan 1, 2024
      let currentOpeningInventory = item.openingInventory;

      for (let dayIndex = 0; dayIndex < item.days.length; dayIndex++) {
        const day = item.days[dayIndex];
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() + dayIndex);

        await prisma.dailyMetric.upsert({
          where: {
            productId_date: {
              productId: product.id,
              date: currentDate
            }
          },
          update: {
            openingInventory: currentOpeningInventory,
            procurementQty: day.procurementQty,
            procurementUnitPrice: day.procurementPrice,
            salesQty: day.salesQty,
            salesUnitPrice: day.salesPrice,
            uploadBatchId: batch.id
          },
          create: {
            productId: product.id,
            date: currentDate,
            openingInventory: currentOpeningInventory,
            procurementQty: day.procurementQty,
            procurementUnitPrice: day.procurementPrice,
            salesQty: day.salesQty,
            salesUnitPrice: day.salesPrice,
            uploadBatchId: batch.id
          }
        });

        // Calculate next day's opening inventory = current opening + procurement - sales
        currentOpeningInventory = currentOpeningInventory + day.procurementQty - day.salesQty;
        totalMetrics++;
      }
    }

    console.log('✅ Sample data seeded successfully!');
    console.log(`📊 Created ${sampleData.length} products with ${totalMetrics} daily metrics`);
    console.log(`📦 Batch ID: ${batch.id}`);

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleData();