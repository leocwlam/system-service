'use strict'

const { v4: uuidv4 } = require('uuid')

const systemLogger = require('system-logger')
const { Logger } = systemLogger

function createLogger (config) {
  let configLog = { level: systemLogger.level.info }
  let configFile = null
  let configSource = null

  if (!((config === null) ||
    (typeof config === 'undefined') ||
    (config.log === null) ||
    (typeof config.log === 'undefined'))) {
    if (!((config.log.config === null) ||
      (typeof config.log.config === 'undefined'))) {
      configLog = config.log.config
    }

    if (!((config.log.file === null) ||
      (typeof config.log.file === 'undefined'))) {
      configFile = config.log.source
    }

    if (!((config.log.source === null) ||
      (typeof config.log.source === 'undefined'))) {
      configSource = config.log.source
    }
  }

  return new Logger(configLog, configFile, configSource)
}

class SystemService {
  constructor (config, messageConsumer) {
    this.id = uuidv4()
    this.logger = createLogger(config)
    this.config = config
    this.consumer = null
    this.messageConsumer = messageConsumer
  }

  validateMessage (message) {
    if ((message === null) || (typeof message === 'undefined')) {
      throw new Error('Missing message')
    }
    this.messageConsumer.validate(message)
  }

  processMessage (message) {
    try {
      this.validateMessage(message)
    } catch (error) {
      this.logger.log('error', 'Fail validMessage', { Error: error.message, message: message })
    }
    this.messageConsumer.process(message)
  }

  start () {
    this.logger.log('info', 'Create consumer')
    this.messageConsumer.setup(this)
    this.logger.log('info', 'Init consumer monitor')
    this.messageConsumer.start()
    this.logger.log('info', 'SystemService started')
  }

  stop () {
    this.messageConsumer.stop()
    this.logger.log('info', 'SystemService stopped')
  }
}

module.exports.SystemService = SystemService
module.exports.Logger = Logger
module.exports.Logger.Level = systemLogger.level
module.exports.Logger.FileRotateType = systemLogger.fileRotateType
