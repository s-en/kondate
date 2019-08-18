const {
  Aborter,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
  uploadFileToBlockBlob
} = require('@azure/storage-blob');
const crypto = require('crypto')
const fs = require("fs").promises;
const path = require("path");

require("dotenv").config();

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;
const CONTAINER_NAME = process.env.CONTAINER_NAME;

const ONE_MINUTE = 60 * 1000;

function md5hex(str) {
  const md5 = crypto.createHash('md5')
  return md5.update(str, 'binary').digest('hex')
}

async function uploadLocalFile(aborter, contentsURL, filePath) {
  filePath = path.resolve(filePath);
  const fileName = path.basename(filePath);
  const blockBlobURL = BlockBlobURL.fromContainerURL(contentsURL, fileName);
  return await uploadFileToBlockBlob(aborter, filePath, blockBlobURL);
}

async function readFile(aborter, containerURL, filePath) {
  try {
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, filePath);
    const downloadResponse = await blockBlobURL.download(aborter, 0);
    return downloadResponse.readableStreamBody.read(content.length).toString();
  } catch(e) {
    if(e.statusCode === 404) {
      return {};
    }
    throw e;
  }
}

async function execute() {
  const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
  const pipeline = StorageURL.newPipeline(credentials);
  const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);

  const rootURL = ContainerURL.fromServiceURL(serviceURL, CONTAINER_NAME);
  const mdURL = ContainerURL.fromServiceURL(serviceURL, `${CONTAINER_NAME}/contents`);
  console.log(mdURL.url);

  const aborter = Aborter.timeout(30 * ONE_MINUTE);

  // read contents list
  const contents = await readFile(aborter, rootURL, 'contents.json');

  const files = await fs.readdir("./md_new");
  for(const f of files) {
    const title = f.split('.md')[0];
    const fname = `${md5hex(title+new Date().toISOString())}.md`;
    const content = await fs.readFile(`./md_new/${f}`, 'utf8');
    // create new hashed file
    await fs.mkdir('./md_hashed/').catch(e => {});
    await fs.writeFile(`./md_hashed/${fname}`, content);
    console.log(`Created ${fname}`);
    // add new file to contents list
    contents[fname] = {
      title: title,
      tags: [],
      created_at: new Date().toISOString()
    };
    // deploy md
    await uploadLocalFile(aborter, mdURL, `./md_hashed/${fname}`);
    console.log(`Local file "./md_hashed/${fname}" is uploaded`);
    await fs.mkdir('./md_uploaded/').catch(e => {});
    await fs.rename(`./md_new/${f}`, `./md_uploaded/${f}`);
  }
  // deploy contents.json
  await fs.writeFile(`./contents.json`, JSON.stringify(contents));
  await uploadLocalFile(aborter, rootURL, 'contents.json');
};

execute().then(() => console.log("Done")).catch((e) => console.log(e));