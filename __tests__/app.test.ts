const request = require("supertest");
// const app = require("../app");
import app from "../app";
import { Article, ArticleWithId, Body, Topic } from "../types";
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const db = require("../db/connection");
const endpointsJson = require("../endpoints.json");

const allEndpoints = Object.keys(endpointsJson);

beforeEach(() => {
  return seed(testData);
});

afterAll(() => db.end());

describe("/api/topics", () => {
  test("GET 200: should respond with an array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }: { body: Body }) => {
        const topics: Topic[] | undefined = body.topics;
        expect(topics).toHaveLength(3);
        topics?.forEach((topic: Topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
  test("GET 404: should respond with approriate status and message when sending request to endpoint that doesn't exist", () => {
    return request(app)
      .get("/api/notARoute")
      .expect(404)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Invalid url");
      });
  });
  test("POST 201: should respond with appropriate status and inserted topic", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "food", description: "yummy things" })
      .set("Accept", "application/json")
      .expect(201)
      .then(({ body }: { body: Body }) => {
        const topic = body.topic;
        expect(topic).toMatchObject({
          slug: "food",
          description: "yummy things",
        });
      });
  });
  test("POST 400: should respond with appropriate status and msg when request body is missing properties", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "food" })
      .set("Accept", "application/json")
      .expect(400)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request");
      });
  });
  test("POST 400: should respond with appropriate status and msg when request body is missing properties", () => {
    return request(app)
      .post("/api/topics")
      .send({ description: "yummy things" })
      .set("Accept", "application/json")
      .expect(400)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request");
      });
  });
  test("POST 400: should respond with appropriate status and msg when request body empty", () => {
    return request(app)
      .post("/api/topics")
      .send({})
      .set("Accept", "application/json")
      .expect(400)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request");
      });
  });
  test("POST 404: should respond with appropriate status and msg when slug already exists", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "mitch", description: "yummy things" })
      .set("Accept", "application/json")
      .expect(404)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Value already exists");
      });
  });
});

describe("/api", () => {
  test("GET 200: should respond with an object describing all available api endpoints", () => {
    return (
      request(app)
        .get("/api")
        .expect(200)
        //   .then(({ body: { endpoints } }) => {
        .then(({ body }: { body: any }) => {
          const endpoints = body.endpoints;
          allEndpoints.forEach((endpoint) => {
            expect(endpoints).toHaveProperty(endpoint);
          });
        })
    );
  });
  test("GET 404: should respond with approriate status and message when sending request to endpoint that doesn't exist", () => {
    return request(app)
      .get("/notARoute")
      .expect(404)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Invalid url");
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET 200: should return article when requesting valid id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }: { body: Body }) => {
        const article = body.article;
        expect(article).toMatchObject({
          article_id: 1,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("GET 404: should response with appropriate status and msg when accessing non-existent id", () => {
    return request(app)
      .get("/api/articles/9999999")
      .expect(404)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Article not found");
      });
  });
  test("GET 400: should response with appropriate status and msg when accessing invalid id", () => {
    return request(app)
      .get("/api/articles/invalidId")
      .expect(400)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request");
      });
  });
  test("GET 200: should have comment_count property", () => {
    return (
      request(app)
        .get("/api/articles/1")
        .expect(200)
        //   .then(({ body: { article } }) => {
        .then(({ body }: { body: Body }) => {
          const article = body.article;
          expect(article).toHaveProperty("comment_count");
          expect(article?.comment_count).toBe(11);
        })
    );
  });
  test("GET 200: should have 0 comment_count for articles with no comments", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }: { body: Body }) => {
        const article = body.article;
        expect(article?.comment_count).toBe(0);
      });
  });
  test("PATCH 200: should respond with appropriate status code when patch is successful and return updated article", () => {
    const newVote = { inc_votes: 10 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .set("Accept", "application/json")
      .expect(200)
      .then(({ body }: { body: Body }) => {
        const article = body.article;
        expect(article?.article_id).toBe(1);
        expect(article?.votes).toBe(110);
      });
  });
  test("PATCH 404: should respond with appropriate status and msg when trying to update non-existent article", () => {
    const newVote = { inc_votes: 10 };
    return request(app)
      .patch("/api/articles/99999")
      .send(newVote)
      .set("Accept", "application/json")
      .expect(404)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Resource not found");
      });
  });
  test("PATCH 400: should respond with appropriate status and msg when trying to update invalid article id", () => {
    const newVote = { inc_votes: 10 };
    return request(app)
      .patch("/api/articles/notAValidId")
      .send(newVote)
      .set("Accept", "application/json")
      .expect(400)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request");
      });
  });
  test("PATCH 400: should respond with appropriate status and msg when trying to update article with invalid inc_vote", () => {
    const newVote = { inc_votes: "invalid votes" };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .set("Accept", "application/json")
      .expect(400)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request");
      });
  });
  test("PATCH 400: should respond with appropriate status and msg when trying to update article with empty object", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .set("Accept", "application/json")
      .expect(400)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request");
      });
  });
  test("PATCH 400: should respond with appropriate status and msg when trying to update article with incorrect keys", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ wrong: "i am a wrong key" })
      .set("Accept", "application/json")
      .expect(400)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request");
      });
  });
  test("DELETE 200: should respond with approriate status and msg on successful delete", () => {
    return request(app).delete("/api/articles/1").expect(200);
  });
  test("DELETE 400: should respond with appropriate status and msg if id is invalid", () => {
    return request(app)
      .delete("/api/articles/notValidId")
      .expect(400)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request");
      });
  });
  test("DELETE 404: should respond with appropriate status and msg if id is non-existent", () => {
    return request(app)
      .delete("/api/articles/999")
      .expect(404)
      .then(({ body }: { body: Body }) => {
        const msg = body.msg;
        expect(msg).toBe("Resource not found");
      });
  });
});

describe("/api/articles", () => {
  test("GET 200: should respond with an array of articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }: { body: Body }) => {
        const articles: Article[] | undefined = body.articles;
        expect(articles?.length).not.toBe(0);
        articles?.forEach((article) => {
          expect(article).not.toHaveProperty("body");
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET 200: should respond with an array of articles sorted by date", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }: { body: Body }) => {
        const articles: ArticleWithId[] | undefined = body.articles;
        const checkSort = articles
          ?.map((article) => article)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
        expect(articles).toEqual(checkSort);
      });
  });
});
//   test("GET 200: should respond with array of articles filtered by topic if provided", () => {
//     return request(app)
//       .get("/api/articles?topic=cats")
//       .expect(200)
//       .then(({ body: { articles } }) => {
//         expect(articles).toHaveLength(1);
//         articles.forEach((article) => {
//           expect(article).toMatchObject({
//             article_id: expect.any(Number),
//             title: expect.any(String),
//             topic: "cats",
//             created_at: expect.any(String),
//             votes: expect.any(Number),
//             article_img_url: expect.any(String),
//             comment_count: expect.any(String),
//           });
//         });
//       });
//   });
//   test("GET 404: should respond with appropriate status and msg if query is invalid", () => {
//     return request(app)
//       .get("/api/articles?topic=notAValidTopic")
//       .expect(404)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Resource not found");
//       });
//   });
//   test("GET 200: should respond with empty array if topic is valid but no articles", () => {
//     return request(app)
//       .get("/api/articles?topic=paper")
//       .expect(200)
//       .then(({ body: { articles } }) => {
//         expect(articles).toEqual([]);
//       });
//   });
//   test("GET 200: should respond with array of articles sorted by provided query in descending order by default", () => {
//     return request(app)
//       .get("/api/articles?sort_by=author")
//       .expect(200)
//       .then(({ body: { articles } }) => {
//         expect(articles).toBeSortedBy("author", { descending: true });
//       });
//   });
//   test("GET 200: should respond with array of articles ordered by provided query", () => {
//     return request(app)
//       .get("/api/articles?order=asc")
//       .expect(200)
//       .then(({ body: { articles } }) => {
//         expect(articles).toBeSortedBy("created_at");
//       });
//   });
//   test("GET 200: should respond with array of articles sorted by provided query and ascending order when query provided", () => {
//     return request(app)
//       .get("/api/articles?sort_by=author&order=asc")
//       .expect(200)
//       .then(({ body: { articles } }) => {
//         expect(articles).toBeSortedBy("author", { descending: false });
//       });
//   });
//   test("GET 400: should respond with appropriate status and msg when providing invalid sort_by", () => {
//     return request(app)
//       .get("/api/articles?sort_by=notValid")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("GET 400: should respond with appropriate status and msg when providing invalid order", () => {
//     return request(app)
//       .get("/api/articles?order=notValid")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("POST 201: should respond with appropriate status and inserted article", () => {
//     const article = {
//       author: "lurker",
//       title: "test title",
//       body: "test body",
//       topic: "mitch",
//       article_img_url: "testImgUrl.com",
//     };
//     return request(app)
//       .post("/api/articles")
//       .send(article)
//       .set("Accept", "application/json")
//       .expect(201)
//       .then(({ body: { article } }) => {
//         expect(article).toMatchObject({
//           article_id: expect.any(Number),
//           created_at: expect.any(String),
//           votes: 0,
//           author: "lurker",
//           title: "test title",
//           body: "test body",
//           topic: "mitch",
//           article_img_url: "testImgUrl.com",
//         });
//       });
//   });
//   test("POST 201: should respond with appropriate status and inserted article with default article_img_url", () => {
//     const article = {
//       author: "lurker",
//       title: "test title",
//       body: "test body",
//       topic: "mitch",
//     };
//     return request(app)
//       .post("/api/articles")
//       .send(article)
//       .set("Accept", "application/json")
//       .expect(201)
//       .then(({ body: { article } }) => {
//         expect(article).toMatchObject({
//           article_id: expect.any(Number),
//           created_at: expect.any(String),
//           comment_count: 0,
//           votes: 0,
//           author: "lurker",
//           title: "test title",
//           body: "test body",
//           topic: "mitch",
//           article_img_url:
//             "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
//         });
//       });
//   });
//   test("POST 404: should respond with appropriate status and msg if author not in users table", () => {
//     const article = {
//       author: "notInUsers",
//       title: "test title",
//       body: "test body",
//       topic: "mitch",
//     };
//     return request(app)
//       .post("/api/articles")
//       .send(article)
//       .set("Accept", "application/json")
//       .expect(404)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Not found");
//       });
//   });
//   test("POST 400: should respond with appropriate status and msg if request body missing properties", () => {
//     const article = {
//       author: "notInUsers",
//       body: "test body",
//       topic: "mitch",
//     };
//     return request(app)
//       .post("/api/articles")
//       .send(article)
//       .set("Accept", "application/json")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("POST 404: should respond with appropriate status and msg if topic not in topics table", () => {
//     const article = {
//       author: "notInUsers",
//       title: "test title",
//       body: "test body",
//       topic: "notInTopics",
//     };
//     return request(app)
//       .post("/api/articles")
//       .send(article)
//       .set("Accept", "application/json")
//       .expect(404)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Not found");
//       });
//   });
//   test("POST 400: should respond with appropriate status and msg if request body is empty", () => {
//     const article = {};
//     return request(app)
//       .post("/api/articles")
//       .send(article)
//       .set("Accept", "application/json")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("GET 200: should respond with correct page of results if specified with default limit of 10", () => {
//     return request(app)
//       .get("/api/articles?p=1")
//       .expect(200)
//       .then(({ body: { articles } }) => {
//         expect(articles).toHaveLength(10);
//       });
//   });
//   test("GET 200: should respond with correct number of articles if limit is specified", () => {
//     return request(app)
//       .get("/api/articles?limit=5&p=1")
//       .expect(200)
//       .then(({ body: { articles } }) => {
//         expect(articles).toHaveLength(5);
//       });
//   });
//   test("GET 200: should respond with total_count property containing correct number of articles before any limit is applied", () => {
//     return request(app)
//       .get("/api/articles?limit=5&p=1")
//       .expect(200)
//       .then(({ body: { articles, total_count } }) => {
//         expect(articles).toHaveLength(5);
//         expect(total_count).toBe(13);
//       });
//   });
//   test("GET 200: should respond with correct total_count when filter is applied", () => {
//     return request(app)
//       .get("/api/articles?topic=cats&limit=5&p=1")
//       .expect(200)
//       .then(({ body: { total_count } }) => {
//         expect(total_count).toBe(1);
//       });
//   });
//   test("GET 400: should respond with appropriate status and msg if page is invalid", () => {
//     return request(app)
//       .get("/api/articles?topic=cats&p=notValid&order=asc")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("GET 400: should respond with appropriate status and msg if limit is invalid", () => {
//     return request(app)
//       .get("/api/articles?topic=cats&limit=notValid&order=asc")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
// });

// describe("/api/articles/:article_id/comments", () => {
//   test("GET 200: should respond with comments associated with the article_id sorted by date", () => {
//     return request(app)
//       .get("/api/articles/1/comments")
//       .expect(200)
//       .then(({ body: { comments } }) => {
//         expect(comments.length > 0).toBe(true);
//         comments.forEach((comment) => {
//           expect(comment).toMatchObject({
//             article_id: 1,
//             comment_id: expect.any(Number),
//             created_at: expect.any(String),
//             author: expect.any(String),
//             body: expect.any(String),
//             votes: expect.any(Number),
//           });
//         });
//       });
//   });
//   test("GET 200: comments should be sorted by date", () => {
//     return request(app)
//       .get("/api/articles/1/comments")
//       .expect(200)
//       .then(({ body: { comments } }) => {
//         expect(comments.length > 0).toBe(true);
//         expect(comments).toBeSortedBy("created_at", { descending: true });
//       });
//   });
//   test("GET 404: should respond with appropriate status and msg if requesting non-existent id", () => {
//     return request(app)
//       .get("/api/articles/99999/comments")
//       .expect(404)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Resource not found");
//       });
//   });
//   test("GET 400: should respond with appropriate status and msg if requesting invalid id", () => {
//     return request(app)
//       .get("/api/articles/notAValidID/comments")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("GET 200: should respond with correct status and empty array if article exists but has no comments", () => {
//     return request(app)
//       .get("/api/articles/13/comments")
//       .expect(200)
//       .then(({ body: { comments } }) => {
//         expect(comments).toEqual([]);
//       });
//   });
//   test("POST 201: should respond with inserted comment", () => {
//     return request(app)
//       .post("/api/articles/1/comments")
//       .send({ username: "lurker", body: "test comments" })
//       .set("Accept", "application/json")
//       .expect(201)
//       .then(({ body: { comment } }) => {
//         expect(comment).toMatchObject({
//           article_id: 1,
//           comment_id: expect.any(Number),
//           created_at: expect.any(String),
//           author: "lurker",
//           body: "test comments",
//           votes: expect.any(Number),
//         });
//       });
//   });
//   test("POST 404: should respond with appropriate status and msg when requesting non-existent id", () => {
//     return request(app)
//       .post("/api/articles/999/comments")
//       .send({ username: "lurker", body: "test comments" })
//       .set("Accept", "application/json")
//       .expect(404)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Resource not found");
//       });
//   });
//   test("POST 400: should respond with appropriate status and msg when requesting invalid id", () => {
//     return request(app)
//       .post("/api/articles/invalidId/comments")
//       .send({ username: "lurker", body: "test comments" })
//       .set("Accept", "application/json")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("POST 404: should respond with appropriate status and msg when request is sent with incorrect user", () => {
//     return request(app)
//       .post("/api/articles/1/comments")
//       .send({ username: "userNotInDb", body: "test comments" })
//       .set("Accept", "application/json")
//       .expect(404)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Not found");
//       });
//   });
//   test("POST 400: should respond with appropriate status and msg when request is sent without body", () => {
//     return request(app)
//       .post("/api/articles/1/comments")
//       .send({ username: "lurker" })
//       .set("Accept", "application/json")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("GET 200: should respond with correct page with default limit of 10", () => {
//     return request(app)
//       .get("/api/articles/1/comments?p=1")
//       .expect(200)
//       .then(({ body: { comments } }) => {
//         expect(comments).toHaveLength(10);
//         comments.forEach((comment) => {
//           expect(comment).toMatchObject({
//             article_id: 1,
//             comment_id: expect.any(Number),
//             created_at: expect.any(String),
//             author: expect.any(String),
//             body: expect.any(String),
//             votes: expect.any(Number),
//           });
//         });
//       });
//   });
//   test("GET 200: should respond with correct page and limit", () => {
//     return request(app)
//       .get("/api/articles/1/comments?p=2&limit=3")
//       .expect(200)
//       .then(({ body: { comments } }) => {
//         expect(comments).toHaveLength(3);
//       });
//   });
//   test("GET 400: should respond with appropriate status and msg when p query is invalid", () => {
//     return request(app)
//       .get("/api/articles/1/comments?p=invalid")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("GET 400: should respond with appropriate status and msg when limit query is invalid", () => {
//     return request(app)
//       .get("/api/articles/1/comments?limit=invalid")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
// });

// describe("/api/comments", () => {
//   test("DELETE 204: should respond with appropriate status on successful delete", () => {
//     return request(app).delete("/api/comments/1").expect(204);
//   });
//   test("DELETE 400: should respond with appropriate status and msg when trying to delete comment with invalid id", () => {
//     return request(app)
//       .delete("/api/comments/notAValidId")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("DELETE 404: should respond with appropriate status and msg when trying to delete comment with non-existent id", () => {
//     return request(app)
//       .delete("/api/comments/99999")
//       .expect(404)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Resource not found");
//       });
//   });
// });

// describe("/api/users", () => {
//   test("GET 200: should respond with an array of users", () => {
//     return request(app)
//       .get("/api/users")
//       .expect(200)
//       .then(({ body: { users } }) => {
//         expect(users).toHaveLength(4);
//         users.forEach((user) => {
//           expect(user).toMatchObject({
//             username: expect.any(String),
//             name: expect.any(String),
//             avatar_url: expect.any(String),
//           });
//         });
//       });
//   });
// });

// describe("/api/users/:username", () => {
//   test("GET 200: should respond with user object", () => {
//     return request(app)
//       .get("/api/users/lurker")
//       .expect(200)
//       .then(({ body: { user } }) => {
//         expect(user).toMatchObject({
//           username: "lurker",
//           name: "do_nothing",
//           avatar_url:
//             "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
//         });
//       });
//   });
//   test("GET 404: should respond with appropriate status and error when requesting invalid username", () => {
//     return request(app)
//       .get("/api/users/IDontExist")
//       .expect(404)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Resource not found");
//       });
//   });
// });

// describe("/api/comments/:comment_id", () => {
//   test("PATCH 200: should return correct status and updated message", () => {
//     return request(app)
//       .patch("/api/comments/1")
//       .send({ inc_votes: 10 })
//       .set("Accept", "application/json")
//       .expect(200)
//       .then(({ body: { comment } }) => {
//         expect(comment).toMatchObject({
//           comment_id: 1,
//           body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
//           votes: 26,
//           author: "butter_bridge",
//           created_at: expect.any(String),
//         });
//       });
//   });
//   test("PATCH 400: should respond with appropriate status and error when requesting invalid id", () => {
//     return request(app)
//       .patch("/api/comments/notAValidId")
//       .send({ inc_votes: 10 })
//       .set("Accept", "application/json")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("PATCH 400: should respond with appropriate status and error when request body has invalid key", () => {
//     return request(app)
//       .patch("/api/comments/notAValidId")
//       .send({ notValidKey: 10 })
//       .set("Accept", "application/json")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("PATCH 400: should respond with appropriate status and error when request body is empty", () => {
//     return request(app)
//       .patch("/api/comments/notAValidId")
//       .send({})
//       .set("Accept", "application/json")
//       .expect(400)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Bad request");
//       });
//   });
//   test("PATCH 404: should respond with appropriate status and error when requesting non-existent id", () => {
//     return request(app)
//       .patch("/api/comments/99999")
//       .send({ inc_votes: 10 })
//       .set("Accept", "application/json")
//       .expect(404)
//       .then(({ body: { msg } }) => {
//         expect(msg).toBe("Resource not found");
//       });
//   });
// });
