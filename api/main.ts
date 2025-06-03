import { connectDB, shutdown } from '../shared/db';
import { logger } from '../shared/logging';
import { web } from './applications/web';

async function main() {
  try {
    await connectDB();

    web.listen(3000, () => {
      logger.info('listening port 3000');
    });
  } catch (error: any) {
    logger.error(`Failed to start app: ${error.message}`);
    await shutdown(1);
  }
}

main();
