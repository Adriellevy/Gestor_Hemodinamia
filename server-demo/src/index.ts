import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[Demo RAM Server - Hemodinamia] Corriendo en http://localhost:${PORT}`);
});
