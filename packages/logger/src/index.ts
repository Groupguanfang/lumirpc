import k from 'kleur'
import { definePlugin } from 'nanorpc/server'
import winston from 'winston'

export interface LoggerOptions extends winston.LoggerOptions {
}

let logger: winston.Logger
export function useLogger(options: LoggerOptions = {}): winston.Logger {
  if (logger)
    return logger
  logger = winston.createLogger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: 'server.log',
        dirname: 'logs',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
    format: winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${k.dim((timestamp as string).toString())} ${k.bold().cyan(`[${level.toString()}]`)} ${k.blue().dim('(request)')} ${message}`
      }),
    ),
    ...options,
  })
  return logger
}

export const createLoggerPlguin = definePlugin<LoggerOptions>((options = {}) => {
  const logger = useLogger(options)

  return {
    WebSocket: {
      name: 'naily:nanorpc-logger',
      beforeHandle(ctx) {
        ctx.use((ws) => {
          ws.addEventListener('open', (e) => {
            logger.info(`Connected to ${e.target.url}`)
          })
          ws.addEventListener('close', (e) => {
            logger.info(`Disconnected from ${e.target.url}`)
          })
          ws.addEventListener('error', (e) => {
            logger.error(`Error on ${e.target.url}: ${e.message}`)
          })
        })
      },
    },
    Http: {
      name: 'naily:nanorpc-logger',
      beforeHandle(ctx) {
        ctx.use(req => logger.info(`${req.method} ${req.url}`))
      },
    },
  }
})
