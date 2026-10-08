const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require('fs');

async function run() {
  const imageBuffer = fs.readFileSync('C:/Users/ADK53/.gemini/antigravity/brain/37b57c63-66dd-40ca-bd4e-7475f6c96edd/.user_uploaded/media_1791436488724.png');
  const tfimage = tf.node.decodeImage(imageBuffer);
  const model = await mobilenet.load();
  const predictions = await model.classify(tfimage);
  console.log('Predictions: ', predictions);
}
run();
