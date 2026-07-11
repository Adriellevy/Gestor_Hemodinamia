import './setup-e2e-env';
import { seedCamasTestDb } from './camas-fixture';

seedCamasTestDb()
  .then((ids) => {
    console.log('BD de test sembrada:', ids);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error sembrando la BD de test:', err);
    process.exit(1);
  });
