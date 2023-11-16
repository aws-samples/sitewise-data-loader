import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClusterUtil } from './helpers/cluster.util';

export async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger:
            process.env.ENVIRONMENT === 'dev'
                ? ['log', 'debug', 'error', 'verbose', 'warn']
                : ['log', 'error', 'warn'],
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.listen(3000, '127.0.0.1');
}

if (process.env.CLUSTER_MODE && process.env.CLUSTER_MODE === 'true') {
    ClusterUtil.register(bootstrap);
} else {
    bootstrap();
}
