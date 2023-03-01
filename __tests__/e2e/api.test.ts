import { beforeEach } from "node:test";
import request from "supertest";
import { app } from "../../src/index";
import { usersCollections } from "../../src/repositories/db";

describe("blogs", () => {
  beforeAll(async () => {
    await request(app).delete("/testing/all-data");
  });

  it("return 200 and empty pagination`s array", async () => {
    const result = await request(app).get("/blogs").expect(200);

    expect(result.body).toEqual({
      pagesCount: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: [],
    });
  });

  it("return 201 and created blog", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Mark",
        description: "string",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    expect(result.body).toEqual({
      id: expect.any(String),
      name: "Mark",
      description: "string",
      websiteUrl: "https://github.com/",
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  it("return 200 and pagination`s array with one ", async () => {
    const result = await request(app)
      .get(
        "/blogs/?searchNameTerm=mark&sortBy=createdAt&sortDirection=desc&pageNumber=1&pageSize=10"
      )
      .expect(200);

    expect(result.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          id: expect.any(String),
          name: "Mark",
          description: "string",
          websiteUrl: "https://github.com/",
          createdAt: expect.any(String),
          isMembership: false,
        },
      ],
    });
  });

  it("return 400, name", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "1234567891011112131415",
        description: "string",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);

    expect(result.body).toEqual({
      errorsMessages: expect.any(Array),
    });
  });

  it("return 400,description", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "JIM",
        description:
          "Эта функция доступна в версиях Frontline, Business Plus, Enterprise, Education Fundamentals, Education Standard, Teaching and Learning Upgrade и Education Plus, G Suite Basic, G Suite Business, Cloud Identity Premium. Сравнение версий Как администратор, вы можете развернуть устройства Android с уже действующими для них правилами организации. Когда пользователь включает устройство, оно проверяет, назначена ли ему корпоративная конфигурация. Если это так, на устройство скачивается приложение Android Device Policy и выполняется автоматическая настройка устройства.",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);

    expect(result.body).toEqual({
      errorsMessages: expect.any(Array),
    });
  });

  it("return 400, websiteUrl", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "JON",
        description: "string",
        websiteUrl: "hreni",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);

    expect(result.body).toEqual({
      errorsMessages: expect.any(Array),
    });
  });

  it("return 400, websiteUrl length", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "JON",
        description: "string",
        websiteUrl:
          "https://githubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithub.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);

    expect(result.body).toEqual({
      errorsMessages: expect.any(Array),
    });
  });

  it("return 401, Unauthorized", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "JON",
        description: "string",
        websiteUrl: "https://github.com/",
      })
      .expect(401);
  });

  it("return 200 FINDBYID", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Yarg",
        description: "HEY GaYS",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    await request(app)
      .get("/blogs/" + result.body.id)
      .expect(200, result.body);
  });

  it("return 404 FINDBYID", async () => {
    await request(app).get("/blogs/-1000").expect(404);
  });

  it("return 204 UPDATEBLOG", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    await request(app)
      .put("/blogs/" + result.body.id)
      .send({
        name: "Serg",
        description: "OW NO",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(204);

    const result2 = await request(app).get("/blogs/" + result.body.id);
    expect(result2.body.description).toBe("OW NO");
  });

  it("return 404 UPDATEBLOG", async () => {
    await request(app)
      .put("/blogs/-1000")
      .send({
        name: "Serg",
        description: "OW NO",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(404);
  });

  it("return 401 UPDATEBLOG", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "KOOT",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    await request(app)
      .put("/blogs/" + result.body.id)
      .send({
        name: "Serg",
        description: "OW NO",
        websiteUrl: "https://github.com/",
      })
      .expect(401);
  });

  it("return 400 UPDATEBLOG name", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "KOOT",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    await request(app)
      .put("/blogs/" + result.body.id)
      .send({
        name: "KOOTKOOTKOOTKOOTKOOTKOOTKOOTKOOTKOOTKOOTKOOTKOOTKOOT",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it("return 400 UPDATEBLOG description", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "KOOT",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    await request(app)
      .put("/blogs/" + result.body.id)
      .send({
        name: "KOOT",
        description:
          "HEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY momsHEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it("return 400 UPDATEBLOG name", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "KOOT",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    await request(app)
      .put("/blogs/" + result.body.id)
      .send({
        name: "KOOT",
        description: "HEY moms",
        websiteUrl:
          "https://githubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithubgithub.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it("return 204 DELETEBLOG", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    await request(app)
      .delete("/blogs/" + result.body.id)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(204);

    await request(app)
      .get("/blogs/" + result.body.id)
      .expect(404);
  });

  it("return 401 DELETEBLOG", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    await request(app)
      .delete("/blogs/" + result.body.id)
      .expect(401);
  });

  it("return 404 DELETEBLOG", async () => {
    await request(app)
      .delete("/blogs/-100")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(404);
  });

  it(" return 201 POSTPOSRBYBLOGID", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/blogs/" + result.body.id + "/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    expect(result2.body).toEqual({
      id: expect.any(String),
      title: "HOOKOV POLON ROT",
      shortDescription: "string",
      content: "VIDEO VAPE",
      blogId: result.body.id,
      blogName: "Serg",
      createdAt: expect.any(String),
    });
  });

  it(" return 401 POSTPOSRBYBLOGID", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/blogs/" + result.body.id + "/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
      })
      .expect(401);
  });

  it(" return 404 POSTPOSRBYBLOGID", async () => {
    const result2 = await request(app)
      .post("/blogs/-1000/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(404);
  });

  it(" return 400 POSTPOSRBYBLOGID title ", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/blogs/" + result.body.id + "/posts")
      .send({
        title:
          "HOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 400 POSTPOSRBYBLOGID shortDescription ", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/blogs/" + result.body.id + "/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription:
          "stringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstring",
        content: "VIDEO VAPE",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 400 POSTPOSRBYBLOGID TITLE ", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/blogs/" + result.body.id + "/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content:
          "VIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPE",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 200 and pagination arr", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Mark",
        description: "string",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .get("/blogs/" + result.body.id + "/posts")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(200);

    expect(result2.body).toEqual({
      pagesCount: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: expect.any(Array),
    });
  });

  it(" return 404 and pagination arr", async () => {
    const result2 = await request(app)
      .get("/blogs/-1000/posts")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(404);
  });
});

describe("post", () => {
  beforeAll(async () => {
    await request(app).delete("/testing/all-data");
  });

  it(" return 201 CREATEPOST", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    expect(result2.body).toEqual({
      id: expect.any(String),
      title: "HOOKOV POLON ROT",
      shortDescription: "string",
      content: "VIDEO VAPE",
      blogId: result.body.id,
      blogName: "Serg",
      createdAt: expect.any(String),
    });
  });

  it(" return 400 CREATEPOST title", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title:
          "HOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 400 CREATEPOST shortDescription", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription:
          "stringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringvstringstringstring",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });
  it(" return 400 CREATEPOST content", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content:
          "VIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPEVAPEVIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 400 CREATEPOST blogId", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title:
          "HOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROTHOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: "-1000000",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 401 CREATEPOST", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .expect(401);
  });

  it(" return 200 GETPOST", async () => {
    const result = await request(app).get("/posts").expect(200);

    expect(result.body).toEqual({
      pagesCount: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: expect.any(Array),
    });
  });

  it(" return 200 GETPOSTBYID", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .get("/posts/" + result2.body.id)
      .expect(200);

    expect(result3.body).toEqual({
      id: expect.any(String),
      title: "HOOKOV POLON ROT",
      shortDescription: "string",
      content: "VIDEO VAPE",
      blogId: result.body.id,
      blogName: "Serg",
      createdAt: expect.any(String),
    });
  });

  it(" return 404 GETPOSTBYID", async () => {
    const result3 = await request(app).get("/posts/-1000").expect(404);
  });

  it(" return 204 UPDATEPOST", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .put("/posts/" + result2.body.id)
      .send({
        title: "OHMYMAY",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(204);

    const result4 = await request(app).get("/posts/" + result2.body.id);

    expect(result4.body).toEqual({
      id: expect.any(String),
      title: "OHMYMAY",
      shortDescription: "string",
      content: "VIDEO VAPE",
      blogId: result.body.id,
      blogName: "Serg",
      createdAt: expect.any(String),
    });
  });

  it(" return 400 UPDATEPOST title", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .put("/posts/" + result2.body.id)
      .send({
        title: "OHMYMAYOHMYMAYOHMYMAYOHMYMAYOHMYMAY",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 400 UPDATEPOST shortDescription", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .put("/posts/" + result2.body.id)
      .send({
        title: "OHMYMAY",
        shortDescription:
          "stringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstringstring",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 400 UPDATEPOST content", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .put("/posts/" + result2.body.id)
      .send({
        title: "OHMYMAY",
        shortDescription: "string",
        content:
          "VIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEVIDEO VAPEff",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 400 UPDATEPOST blogId", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .put("/posts/" + result2.body.id)
      .send({
        title: "OHMYMAYOHMYMAYOHMYM",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: 4,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it(" return 400 UPDATEPOST blogId", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .put("/posts/" + result2.body.id)
      .send({
        title: "OHMYMAYOHMYMAYOHM",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .expect(401);
  });

  it(" return 404 UPDATEPOST", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .put("/posts/-1000")
      .send({
        title: "OHMYMAYOHMYMAYOHM",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(404);
  });

  it("return 204 DELETEPOST ", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .delete("/posts/" + result2.body.id)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(204);

    const result4 = await request(app)
      .get("/posts/" + result2.body.id)
      .expect(404);
  });

  it("return 401 DELETEPOST ", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Serg",
        description: "HEY moms",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .delete("/posts/" + result2.body.id)
      .expect(401);
  });

  it("return 404 DELETEPOST ", async () => {
    const result3 = await request(app)
      .delete("/posts/-1000")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(404);
  });

  it("return 201 POSTCOMMENTSBYPOSTID", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "markizori",
        password: "123456uher",
        email: "markuher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "markuher@yahoo.com",
        password: "123456uher",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    expect(result5.body).toEqual({
      id: expect.any(String),
      content: "Nu takoe ya smotret ne budu",
      commentatorInfo: {
        userId: result3.body.id,
        userLogin: result3.body.login,
      },
      createdAt: expect.any(String),
    });
  });

  it("return 400 POSTCOMMENTSBYPOSTID content min/max", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "Kate2",
        password: "123456t",
        email: "kate@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "kate@yahoo.com",
        password: "123456t",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(400);

    const result6 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content:
          "NukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotNukaktuvotff",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(400);
  });

  it("return 401 POSTCOMMENTSBYPOSTID", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer -10000")
      .expect(401);
  });

  it("return 404 POSTCOMMENTSBYPOSTID", async () => {
    const result3 = await request(app)
      .post("/users")
      .send({
        login: "boba",
        password: "123456uher",
        email: "bobadu@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "bobadu@yahoo.com",
        password: "123456uher",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/-1000/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(404);
  });

  it("return 200 GETCOMMENTSBYPOSTID", async () => {
    await request(app).delete("/testing/all-data");

    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result6 = await request(app)
      .get("/posts/" + result2.body.id + "/comments")
      .expect(200);

    expect(result6.body).toEqual({
      pagesCount: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: [
        {
          id: expect.any(String),
          content: expect.any(String),
          commentatorInfo: {
            userId: result5.body.commentatorInfo.userId,
            userLogin: result5.body.commentatorInfo.userLogin,
          },
          createdAt: expect.any(String),
        },
      ],
    });
  });

  it("return 200 GETCOMMENTSBYPOSTID", async () => {
    await request(app).delete("/testing/all-data");

    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result6 = await request(app)
      .get("/posts/" + result2.body.id + "/comments")
      .expect(200);

    expect(result6.body).toEqual({
      pagesCount: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: [
        {
          id: expect.any(String),
          content: expect.any(String),
          commentatorInfo: {
            userId: result5.body.commentatorInfo.userId,
            userLogin: result5.body.commentatorInfo.userLogin,
          },
          createdAt: expect.any(String),
        },
      ],
    });
  });
  it("return 404 GETCOMMENTSBYPOSTID", async () => {
    await request(app).delete("/testing/all-data");
    const result6 = await request(app).get("/posts/-1000/comments").expect(404);
  });
});

describe("Users", () => {
  beforeAll(async () => {
    await request(app).delete("/testing/all-data");
  });

  it("return 201 POSTUSER", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "mark",
        password: "123456",
        email: "markdlnv@gmail.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    expect(result.body).toEqual({
      id: expect.any(String),
      login: "mark",
      email: "markdlnv@gmail.com",
      createdAt: expect.any(String),
    });
  });

  it("return 400 POSTUSER login min ", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "ma",
        password: "123456",
        email: "markdlnv@gmail.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it("return 400 POSTUSER login max ", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "markmarkmark",
        password: "123456",
        email: "markdlnv@gmail.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it("return 400 POSTUSER password min ", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "mark",
        password: "12345",
        email: "markdlnv@gmail.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it("return 400 POSTUSER password max ", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "mark",
        password: "123456789123456789123",
        email: "markdlnv@gmail.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(400);
  });

  it("return 401 POSTUSER ", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "mark",
        password: "123456789",
        email: "markdlnv@gmail.com",
      })
      .expect(401);
  });

  it("return 200 GETUSER", async () => {
    const result = await request(app)
      .get("/users")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(200);

    expect(result.body).toEqual({
      pagesCount: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: expect.any(Array),
    });
  });

  it("return 401 GETUSER", async () => {
    const result = await request(app).get("/users").expect(401);
  });

  it("return 204 DELETEUSER", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "mark",
        password: "123456",
        email: "markdlnv@gmail.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .delete("/users/" + result.body.id)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(204);
  });

  it("return 401 DELETEUSER", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "mark",
        password: "123456",
        email: "markdlnv@gmail.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .delete("/users/" + result.body.id)
      .expect(401);
  });

  it("return 404 DELETEUSER", async () => {
    const result2 = await request(app)
      .delete("/users/-1000")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(404);
  });
});

describe("auth", () => {
  beforeAll(async () => {
    await request(app).delete("/testing/all-data");
  });
  it("return 200 POSTAUTH", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "markooo",
        password: "123456",
        email: "markdlnv@gmail.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "markdlnv@gmail.com",
        password: "123456",
      })
      .expect(200);

    expect(result2.body).toEqual({
      accessToken: expect.any(String),
    });
  });

  it("return 400 POSTAUTH login", async () => {
    const result2 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: 345544,
        password: "123456",
      })
      .expect(400);
  });

  it("return 400 POSTAUTH password", async () => {
    const result2 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "markdlnv@gmail.com",
        password: 123456,
      })
      .expect(400);
  });

  it("return 401 POSTAUTH ", async () => {
    const result2 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "markdlnv@gmail.com",
        password: "123456-10000-1000",
      })
      .expect(401);
  });

  it("return 200 GETAUTH", async () => {
    const result = await request(app)
      .post("/users")
      .send({
        login: "markizd",
        password: "123456u",
        email: "markdlnv@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "markdlnv@yahoo.com",
        password: "123456u",
      })
      .expect(200);

    const result3 = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer " + result2.body.accessToken)
      .expect(200);

    expect(result3.body).toEqual({
      email: "markdlnv@yahoo.com",
      login: "markizd",
      userId: result.body.id,
    });
  });

  it("return 204 POSTAUTHREGISTRATION", async () => {
    const result = await request(app)
      .post("/auth/registration")
      .send({
        login: "markizdd",
        password: "123456u",
        email: "kootvfa@yahoo.com",
      })
      .expect(204);
  });

  it("return 400 POSTAUTHREGISTRATION login min/max", async () => {
    const result = await request(app)
      .post("/auth/registration")
      .send({
        login: "ma",
        password: "123456u",
        email: "markdlnv@yahoo.com",
      })
      .expect(400);

    const result2 = await request(app)
      .post("/auth/registration")
      .send({
        login: "markmarkmarkmarkmarkmark",
        password: "123456u",
        email: "markdlnv@yahoo.com",
      })
      .expect(400);
  });
  it("return 400 POSTAUTHREGISTRATION password min/max", async () => {
    const result = await request(app)
      .post("/auth/registration")
      .send({
        login: "markix",
        password: "12345",
        email: "markdlnv@yahoo.com",
      })
      .expect(400);

    const result2 = await request(app)
      .post("/auth/registration")
      .send({
        login: "markix",
        password: "1234567891011121314151617181920",
        email: "markdlnv@yahoo.com",
      })
      .expect(400);
  });
  it("return 400 POSTAUTHREGISTRATION email ", async () => {
    const result = await request(app)
      .post("/auth/registration")
      .send({
        login: "markix",
        password: "123456",
        email: "markjj",
      })
      .expect(400);
  });
  it("return 204 REGISTRATION CONFIRMATION POST ", async () => {
    const result = await request(app)
      .post("/auth/registration")
      .send({
        login: "egorus",
        password: "123456u",
        email: "egorvoron@gmail.com",
      })
      .expect(204);

    const result2 = await usersCollections.findOne({
      email: "egorvoron@gmail.com",
    });

    const result3 = await request(app)
      .post("/auth/registration-confirmation")
      .send({
        code: result2!.emailConfimation.confimationCode,
      })
      .expect(204);
  });
  it("return 400 REGISTRATION CONFIRMATION POST use code after used  ", async () => {
    const result = await request(app)
      .post("/auth/registration")
      .send({
        login: "mariavog",
        password: "123456u",
        email: "mariavog@gmail.com",
      })
      .expect(204);

    const result2 = await usersCollections.findOne({
      email: "mariavog@gmail.com",
    });

    const result3 = await request(app)
      .post("/auth/registration-confirmation")
      .send({
        code: result2!.emailConfimation.confimationCode,
      })
      .expect(204);

    const result4 = await request(app)
      .post("/auth/registration-confirmation")
      .send({
        code: result2!.emailConfimation.confimationCode,
      })
      .expect(400);
  });
  jest.setTimeout(8000);
  it("return 204 REGISTRATION  EMAIL RESENDING ", async () => {
    const result = await request(app)
      .post("/auth/registration")
      .send({
        login: "katerina",
        password: "123456u",
        email: "katerinagot@gmail.com",
      })
      .expect(204);
    const result2 = await usersCollections.findOne({
      email: "katerinagot@gmail.com",
    });
    const result3 = await request(app)
      .post("/auth/registration-email-resending")
      .send({ email: "katerinagot@gmail.com" })
      .expect(204);

    const result4 = await usersCollections.findOne({
      email: "katerinagot@gmail.com",
    });
    expect(result2?.emailConfimation.confimationCode).not.toEqual(
      result4?.emailConfimation.confimationCode
    );
  });
});

describe("comments", () => {
  beforeAll(() => jest.setTimeout(8000)),
    beforeEach(async () => {
      await request(app).delete("/testing/all-data");
    });
  it("return 204 UPDATECOMMENT", async () => {
    await request(app).delete("/testing/all-data");

    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result6 = await request(app)
      .put("/comments/" + result5.body.id)
      .send({
        content: "Nu ladno norm soidet i tak o bozhe",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(204);

    const result7 = await request(app)
      .get("/comments/" + result5.body.id)
      .expect(200);

    expect(result7.body).toEqual({
      id: expect.any(String),
      content: "Nu ladno norm soidet i tak o bozhe",
      commentatorInfo: {
        userId: result5.body.commentatorInfo.userId,
        userLogin: result5.body.commentatorInfo.userLogin,
      },
      createdAt: expect.any(String),
    });
  });
  it("return 400 UPDATECOMMENT", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result6 = await request(app)
      .put("/comments/" + result5.body.id)
      .send({
        content: "Nu ladno norm",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(400);

    const result7 = await request(app)
      .put("/comments/" + result5.body.id)
      .send({
        content:
          "Nu ladno norm soidet i tak o bozheNu ladno norm soidet i tak o bozheNu ladno norm soidet i tak o bozheNu ladno norm soidet i tak o bozheNu ladno norm soidet i tak o bozheNu ladno norm soidet i tak o bozheNu ladno norm soidet i tak o bozheNu ladno norm soidet i tak o bozheNu ladno norm soidet i tak o bozheffffffffffffffff",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(400);
  });
  it("return 401 UPDATECOMMENT ", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result6 = await request(app)
      .put("/comments/" + result5.body.id)
      .send({
        content: "Nu ladno norm soidet i tak o bozhe",
      })
      .expect(401);
  });
  it("return 403 UPDATECOMMENT ", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result6 = await request(app)
      .post("/users")
      .send({
        login: "misha",
        password: "123456mis",
        email: "mishauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result7 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "mishauher@yahoo.com",
        password: "123456mis",
      })
      .expect(200);

    const result8 = await request(app)
      .put("/comments/" + result5.body.id)
      .send({
        content: "Nu ladno norm soidet i tak o bozhe",
      })
      .set("Authorization", "Bearer " + result7.body.accessToken)
      .expect(403);
  });

  it("return 404 UPDATECOMMENT ", async () => {
    await request(app).delete("/testing/all-data");

    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result6 = await request(app)
      .put("/comments/-1000")
      .send({
        content: "Nu ladno norm soidet i tak o bozhe",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(404);
  });
  it("return 204 DELETECOMMENTS", async () => {
    await request(app).delete("/testing/all-data");

    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result6 = await request(app)
      .delete("/comments/" + result5.body.id)
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(204);

    const result7 = await request(app)
      .get("/comments/" + result5.body.id)
      .expect(404);
  });
  it("return 401 DELETECOMMENTS ", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result6 = await request(app)
      .delete("/comments/" + result5.body.id)
      .expect(401);
  });

  it("return 403 DELETECOMMENTS ", async () => {
    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result6 = await request(app)
      .post("/users")
      .send({
        login: "misha",
        password: "123456mis",
        email: "mishauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result7 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "mishauher@yahoo.com",
        password: "123456mis",
      })
      .expect(200);

    const result8 = await request(app)
      .delete("/comments/" + result5.body.id)
      .set("Authorization", "Bearer " + result7.body.accessToken)
      .expect(403);
  });

  it("return 404 DELETECOMMENTS ", async () => {
    await request(app).delete("/testing/all-data");

    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result6 = await request(app)
      .delete("/comments/-1000")
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(404);
  });

  it("return 204 GETCOMMENTS ", async () => {
    await request(app).delete("/testing/all-data");

    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result5 = await request(app)
      .post("/posts/" + result2.body.id + "/comments")
      .send({
        content: "Nu takoe ya smotret ne budu",
      })
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(201);

    const result7 = await request(app)
      .get("/comments/" + result5.body.id)
      .expect(200);

    expect(result7.body).toEqual({
      id: expect.any(String),
      content: "Nu takoe ya smotret ne budu",
      commentatorInfo: {
        userId: result5.body.commentatorInfo.userId,
        userLogin: result5.body.commentatorInfo.userLogin,
      },
      createdAt: expect.any(String),
    });
  });

  it("return 404 GETCOMMENTS ", async () => {
    await request(app).delete("/testing/all-data");

    const result = await request(app)
      .post("/blogs")
      .send({
        name: "Kate",
        description: "HEY boys",
        websiteUrl: "https://github.com/",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result2 = await request(app)
      .post("/posts")
      .send({
        title: "HOOKOV POLON ROT",
        shortDescription: "string",
        content: "VIDEO VAPE",
        blogId: result.body.id,
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result3 = await request(app)
      .post("/users")
      .send({
        login: "gogak",
        password: "123456goga",
        email: "gogauher@yahoo.com",
      })
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201);

    const result4 = await request(app)
      .post("/auth/login")
      .send({
        loginOrEmail: "gogauher@yahoo.com",
        password: "123456goga",
      })
      .expect(200);

    const result6 = await request(app)
      .get("/comments/-1000")
      .set("Authorization", "Bearer " + result4.body.accessToken)
      .expect(404);
  });
});
