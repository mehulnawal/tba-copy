const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../src/models/product.model");
const {
  folderCreated,
  validGoogleDriveFolderUrl,
} = require("../src/controllers/googleCadIntegration.controller");

const secret = "test-cad-webhook-secret";
const request = (body, receivedSecret = secret) => ({
  body,
  get: () => receivedSecret,
});
const invoke = (req) =>
  new Promise((resolve, reject) => {
    const res = {
      statusCode: 0,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        resolve(this);
      },
    };
    folderCreated(req, res, reject);
  });

let originalFindOneAndUpdate;
test.beforeEach(() => {
  process.env.CAD_WEBHOOK_SECRET = secret;
  originalFindOneAndUpdate = Product.findOneAndUpdate;
});
test.afterEach(() => {
  Product.findOneAndUpdate = originalFindOneAndUpdate;
});

test("accepts valid HTTPS Google Drive folder URLs only", () => {
  assert.equal(
    validGoogleDriveFolderUrl("https://drive.google.com/drive/folders/abc123"),
    true,
  );
  assert.equal(
    validGoogleDriveFolderUrl("http://drive.google.com/drive/folders/abc123"),
    false,
  );
  assert.equal(
    validGoogleDriveFolderUrl("https://drive.google.com/file/d/abc123"),
    false,
  );
  assert.equal(
    validGoogleDriveFolderUrl("https://example.com/drive/folders/abc123"),
    false,
  );
});
test("rejects an invalid webhook secret", async () => {
  await assert.rejects(
    invoke(
      request(
        {
          sku: "TBA-GLD-RG0001",
          cadFolderUrl: "https://drive.google.com/drive/folders/abc",
        },
        "wrong",
      ),
    ),
    { statusCode: 401 },
  );
});
test("rejects a missing SKU", async () => {
  await assert.rejects(
    invoke(
      request({ cadFolderUrl: "https://drive.google.com/drive/folders/abc" }),
    ),
    { statusCode: 400 },
  );
});
test("rejects an invalid folder URL", async () => {
  await assert.rejects(
    invoke(
      request({
        sku: "TBA-GLD-RG0001",
        cadFolderUrl: "https://example.com/folder",
      }),
    ),
    { statusCode: 400 },
  );
});
test("returns 404 when the SKU does not exist", async () => {
  Product.findOneAndUpdate = () => ({ select: async () => null });
  await assert.rejects(
    invoke(
      request({
        sku: "TBA-GLD-RG0001",
        cadFolderUrl: "https://drive.google.com/drive/folders/abc",
      }),
    ),
    { statusCode: 404 },
  );
});
test("updates only cadFolderUrl and is safe to repeat", async () => {
  const calls = [];
  Product.findOneAndUpdate = (filter, update, options) => {
    calls.push({ filter, update, options });
    return {
      select: async () => ({
        SKU: filter.SKU,
        cadFolderUrl: update.$set.cadFolderUrl,
      }),
    };
  };
  const payload = {
    sku: " TBA-GLD-RG0001 ",
    cadFolderUrl: " https://drive.google.com/drive/folders/abc ",
  };
  const first = await invoke(request(payload));
  const second = await invoke(request(payload));
  assert.equal(first.statusCode, 200);
  assert.equal(first.body.data.sku, "TBA-GLD-RG0001");
  assert.equal(
    first.body.data.cadFolderUrl,
    "https://drive.google.com/drive/folders/abc",
  );
  assert.deepEqual(calls[0].update, {
    $set: { cadFolderUrl: "https://drive.google.com/drive/folders/abc" },
  });
  assert.deepEqual(calls[0], calls[1]);
});
