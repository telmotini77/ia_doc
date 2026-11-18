# DocuGenius · Estudio y documentos

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Modo de estudio

La misma aplicación reúne el generador documental y el modo **Estudio y atlas**:

- Biblioteca de múltiples documentos, selección del libro principal, lector con resaltados y progreso diario en el orden real de clases.
- Bitácora del docente enlazada al tema, resúmenes, mapas mentales, cuadros sinópticos, tablas comparativas y flashcards.
- Atlas anatómico con origen, inserción, inervación y función, además de los niveles de organización biológica.
- Quiz acumulativo con opción múltiple, completar, correcto/incorrecto, relación de columnas, distractores del texto y revisión de errores.
- Guía para prompts de bioestadística y exportación del material a PDF, Word y Excel.

Los recursos y explicaciones se fundamentan únicamente en el texto extraído del libro principal. Si el material no aporta un ejemplo clínico, la aplicación lo indica en vez de inventarlo.

## Ejecutar localmente

Inicia el backend en una terminal:

```powershell
cd backend
python -m pip install -r requirements.txt
python main.py
```

En otra terminal inicia la interfaz:

```powershell
npm install
npm run dev
```

Abre `http://localhost:5170`. Para usar Docker: `docker compose up --build`.
