import { NeuralClassifier, generateLocalContent } from './src/utils/documentGenerator.js';

async function run() {
  const classifier = new NeuralClassifier();
  
  console.log("--- TEST 1: Entrenamiento del Clasificador ---");
  const stats = await classifier.train();
  console.log("Entrenamiento completado.");
  console.log(`Vocabulario: ${stats.vocabSize} palabras.`);
  console.log(`Pérdida final: ${stats.finalLoss}`);
  console.log(`Precisión final: ${(stats.finalAccuracy * 100).toFixed(1)}%`);
  console.log("Logs tail:");
  stats.logs.slice(-3).forEach(l => console.log(l));

  console.log("\n--- TEST 2: Predicción de Categoría ---");
  const prompt = "necesito un sistema de seguridad y vpn para la red de la empresa";
  const pred = await classifier.predict(prompt);
  console.log(`Prompt: "${prompt}"`);
  console.log(`Categoría predicha: ${pred.category} (Confianza: ${(pred.confidence * 100).toFixed(1)}%)`);

  console.log("\n--- TEST 3: Generación de Contenido Local ---");
  const doc = await generateLocalContent(prompt, "report", pred, "tecnico");
  console.log(`Título generado: "${doc.title}"`);
  console.log(`Herramientas en metodología: ${doc.segundaParte.marcoMetodologico.substring(0, 150)}...`);
}

run().catch(console.error);
