import 'reflect-metadata';

process.env['NODE_ENV'] = 'test';

process.env['APP_NAME'] = 'StageGate API Test';

process.env['APP_VERSION'] = '0.0.0';

process.env['HOST'] = '127.0.0.1';

process.env['PORT'] = '4000';

process.env['CORS_ORIGINS'] = 'http://localhost:3000';

process.env['CORS_CREDENTIALS'] = 'false';

process.env['HTTP_BODY_LIMIT'] = '1mb';

process.env['SWAGGER_ENABLED'] = 'true';
