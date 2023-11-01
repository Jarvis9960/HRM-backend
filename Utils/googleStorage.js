import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(fileName);

const projectId = "braided-complex-403612";
const keyFileName = path.resolve(__dirname, "..", "googlecloudkey.json");

const googleStorage = new Storage({ projectId, keyFilename: keyFileName });

const bucketName = "braided-complex-403612.appspot.com";

const bucket = googleStorage.bucket(bucketName);

export { bucket, bucketName, googleStorage };
