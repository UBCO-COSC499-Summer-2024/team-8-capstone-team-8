const winston = require('winston');

const logger = winston.createLogger({
    level: 'info', // Default level for all transports
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === 'test' ? 'silent' : 'debug', // Silent during tests
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

module.exports = logger;
