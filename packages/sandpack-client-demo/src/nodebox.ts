import { Nodebox } from "@codesandbox/nodebox";

export async function nodeboxDemo() {
  const titleEle = document.createElement("h1");
  titleEle.innerText = "nodebox Demo";
  document.body.appendChild(titleEle);

  const runtimeIframe = document.createElement("iframe");
  runtimeIframe.id = "nodebox-runtime-iframe";
  document.body.appendChild(runtimeIframe);

  const previewIframe = document.createElement("iframe");
  previewIframe.id = "nodebox-preview-iframe";
  document.body.appendChild(previewIframe);

  const emulator = new Nodebox({
    iframe: runtimeIframe,
  });

  await emulator.connect();

  await emulator.fs.init({
    "package.json": JSON.stringify({
      name: "my-app",
    }),
    "main.js": `
    import http from 'http'
     
    const server = http.createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      })
     res.end('Hello from Nodebox')
    })
     
    server.listen(3000, () => {
      console.log('Server is ready!')
    })
      `,
  });

  const shell = emulator.shell.create();
  const serverCommand = await shell.runCommand("node", ["main.js"]);

  const { url } = await emulator.preview.getByShellId(serverCommand.id);

  // Preview Iframe to see output of code
  previewIframe.setAttribute("src", url);
}
