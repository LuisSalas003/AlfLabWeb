const fs = require('fs-extra');
const path = require('path');

const browserPath = path.join(__dirname, 'docs', 'browser');
const docsPath = path.join(__dirname, 'docs');

if (fs.existsSync(browserPath)) {
  console.log('📦 Moviendo archivos de browser/ a docs/...');
  
  // Mover todo de docs/browser/* a docs/
  fs.readdirSync(browserPath).forEach(file => {
    fs.moveSync(
      path.join(browserPath, file),
      path.join(docsPath, file),
      { overwrite: true }
    );
  });
  
  // Eliminar carpeta browser vacía
  fs.removeSync(browserPath);
  console.log('✅ Archivos movidos correctamente - GitHub Pages listo!');
} else {
  console.log('ℹ️  No se encontró carpeta browser/ - todo correcto');
}