const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const readline = require('readline');

const PROTO_PATH = path.join(__dirname, '/../protos/chat.proto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

const proto = grpc.loadPackageDefinition(
  protoLoader.loadSync(
    PROTO_PATH,
    options
  )
);

let username;

const PORT = 3000;
const client = new proto.app.Chat(
  `localhost:${PORT}`,
  grpc.credentials.createInsecure()
);

const main = () => {
  let channel = client.join({user: username});

  const stream = (chunk) => {
    if (chunk.user === username) {
      return;
    }
    console.log(`${chunk.user}: ${chunk.text}`);
  }

  channel.on('data', stream);

  rl.on('line', text => {
    client.send({ user: username, text: text }, res => {});
  });
}

rl.question('Siapa Namamu ? ', (input) => {
  username = input;

  client.user({username: input}, res => {});

  main();
});
