const Koa = require('koa');
const fs = require("fs-extra");
const staticFiles = require('koa-static');
const koaBody = require('koa-body');
const Router = require('koa-router');
const path = require("path");
const Guid = require("guid");


const app = new Koa();
const router = new Router();
const parser = koaBody({
    formLimit: `100mb`,
    multipart: true,
    formidable: {
        uploadDir: __dirname + '/uploads'
    }
});
const directory = path.join(__dirname, 'music', 'directory.json');

const mount = (what, where) => app.use(staticFiles(
    path.join(where, what)
));

mount('/', path.join(__dirname, "..", "build"));
mount('music', path.join(__dirname, "..", "backend"));

router.post('/audio/upload', async ctx => {

    const file = ctx.request.body.files.file;

    const fileName = file.name;
    const filePath = file.path;

    const createdFile =  `${Guid.create().toString()}${path.extname(fileName)}`;
    const newFileName = path.join(
        __dirname,
        'music',
        createdFile
    );

    const fileURL = `${ctx.request.host}/${createdFile}`;
    const currentDirectory = await fs.readJSON(directory);

    currentDirectory.push({
        fileURL,
        fileName,
        filePath
    });

    await fs.writeFile(directory, JSON.stringify(currentDirectory, null, 2));

    await fs.move(filePath, newFileName);

    ctx.body = {
        fileName,
        fileURL
    };
});

app
    .use(parser)
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);