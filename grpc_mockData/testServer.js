// an example of making a test server without Mali and pure @grpc

import path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

// change PROTO_PATH to load a different mock proto file
const PROTO_PATH = path.resolve(__dirname, 'protos/helloworld.proto');
const PORT = '0.0.0.0:50051';

const proto = protoLoader.loadSync(PROTO_PATH);
const definition = grpc.loadPackageDefinition(proto);

const greetMe = (call, callback) => {
  callback(null, { reply: `Hey ${call.request.name}!` });
};

const server = new grpc.Server();

server.addService(definition.HelloWorldService.service, { greetMe });

server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (port) => {
  server.start();
  console.log(`grpc server running on port ${PORT}`);
});
