const chalk = require('chalk');
const mongoose = require('mongoose');

const DataBase = {
  connect: async function () {
    try {
      const connection = mongoose.connect(
        process.env.db || 'mongodb://127.0.0.1:27017/reddit-db2',
        {
          useUnifiedTopology: true,
          useNewUrlParser: true,
          useFindAndModify: false,
          useCreateIndex: true,
        }
      );

      const { name, host, port } = (await connection).connections[0];

      console.log(
        chalk.bold.hex('#000').bgHex('#98ddca')(
          `mongodb is connected to the ${name} database at ${host}:${port}`
        )
      );
    } catch (error) {
      console.log(error.message);
    }
  }
};

module.exports = DataBase;
