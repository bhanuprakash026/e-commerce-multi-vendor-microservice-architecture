const swaggerAutogen = require("swagger-autogen")();

const doc = {
    swagger: "2.0", // ✅ Must be on top level
    info: {
        title: "Auth Service API",
        description: "Automatically generated Swagger docs",
        version: "1.0.0"
    },
    host: "localhost:6001",
    schemes: ["http"], // ✅ not "schemas"
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.router.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
