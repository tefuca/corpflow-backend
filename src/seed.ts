import { NestFactory } from '@nestjs/core';
import { SeedService } from './src/modules/rbac/services/seed.service';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seedSystemFunctions();
    console.log('\n✅ Seed completed successfully.');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
