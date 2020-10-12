const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '/../protos/chat.proto');

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

const users = [];

const join = (call) => {
  users.push(call);
  notifyChat(
    {
      user: "Server",
      text: "Pengguna Baru Bergabung"
    }
  )
}

const send = (call, callback) => {
  notifyChat(call.request);
}

const notifyChat = (message) => {
  users.forEach(user => {
    user.write(message);
  });
}

const user = (call) => {
  console.log(`Halo ${call.request.username}, Selamat Datang Di Aplikasi Chatting`);
}

const main = () => {
  const server = new grpc.Server();
  const PORT = 3000;
  server.addService(proto.app.Chat.service,
                    {
                      join: join,
                      send: send,
                      user: user
                    }
                  );
  server.bind(`localhost:${PORT}`, grpc.ServerCredentials.createInsecure());
  server.start();
  console.log(`Connect to server on PORT: ${PORT}`);
}

main();
