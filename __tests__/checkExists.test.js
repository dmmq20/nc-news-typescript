const { checkExists } = require("../controllers/utils");
const db = require("../db/connection");

afterAll(() => {
  db.end();
});

describe("checkExists", () => {
  test("should return appropriate status and msg when resource does not exist", async () => {
    await expect(
      checkExists("articles", "article_id", 123123)
    ).rejects.toMatchObject({
      status: 404,
      msg: "Resource not found",
    });
  });
  test("should return true if resource exists", async () => {
    await expect(checkExists("articles", "article_id", 2)).resolves.toBe(true);
  });
});
