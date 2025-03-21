import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

const configSwagger = new DocumentBuilder()
  .setTitle('API')
  .setDescription('')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Please enter a valid JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();

function setupSwagger(app: INestApplication) {
  const document = SwaggerModule.createDocument(app, configSwagger);
  const path = process.env.ROUTE || '';
  SwaggerModule.setup(`${path}/docs`, app, document, {
    jsonDocumentUrl: `${path}/swagger/json`,
    customSiteTitle: 'API',
  });
}

export default setupSwagger;
