'use strict'

class MessageConsumer {
  constructor () {
    this.systemService = null
    this.logger = null
  }

  service () {
    return this.systemService
  }

  setup (systemService) {
    this.systemService = systemService
    this.logger = this.systemService.logger
    this.logger.log('info', 'Create message consumer')
    this.create()
  }

  cleanup () {
    this.logger = null
    this.systemService = null
  }

  // Overwrite needs to setup with callback to this.systemService.processMessage(message) during new message received
  create () {
    // Create callback to this.systemService.processMessage(message)
  }

  validate (message) {
  }

  process (message) {
  }

  start () {
    this.logger.log('info', 'Start message consumer')
  }

  stop () {
    this.logger.log('info', 'Stop message consumer')
    this.cleanup()
  }
}

module.exports.MessageConsumer = MessageConsumer
