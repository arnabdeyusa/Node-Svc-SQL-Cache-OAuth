const winston = require('winston');

const logger = winston.createLogger(
    {
        level: 'info',
        format: winston.format.json(),
        transports: [
            new winston.transports.Console({ timestamp: true }),
            new winston.transports.File({ filename: 'error.log', level: 'error', timestamp: true }),
            new winston.transports.File({ filename: 'combined.log', timestamp: true })
        ]
    }
);

module.exports = logger;