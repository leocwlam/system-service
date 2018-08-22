'use strict'

const sinon = require('sinon')

const messageConsumer = require('../src/messageConsumer')
const { MessageConsumer } = messageConsumer

class MockConsumer extends MessageConsumer {
  constructor () {
    super()
    this.simpleTimer = null
    this.startBehavior = sinon.stub()
    this.stopBehavior = sinon.stub()
    this.cleanupBehavior = sinon.stub()
    this.createBehavior = sinon.stub()
    this.validateMessageBehavior = sinon.stub()
    this.processBehavior = sinon.stub()
    this.messages = []
  }

  cleanup () {
    super.cleanup()
    this.cleanupBehavior()
  }

  addInternalMessage (message) {
    this.messages.push(message)
  }

  internalProcess () {
    if (this.messages.length > 0) {
      this.systemService.processMessage(this.messages[0])
      this.messages.shift()
    }
    this.simpleTimer = setTimeout(() => { this.internalProcess() }, 500)
  }

  create () {
    super.create()
    this.internalProcess()
    this.createBehavior()
  }

  validate (message) {
    super.validate(message)
    this.validateMessageBehavior()
  }

  process (message) {
    super.process(message)
    this.processBehavior()
  }

  start () {
    super.start()
    this.startBehavior()
  }

  stop () {
    super.stop()
    clearTimeout(this.simpleTimer)
    this.stopBehavior()
  }

  reportReset () {
    this.startBehavior.reset()
    this.stopBehavior.reset()
    this.cleanupBehavior.reset()
    this.createBehavior.reset()
    this.validateMessageBehavior.reset()
    this.processBehavior.reset()
  }

  behaviorReport () {
    return {
      isStartCalled: this.startBehavior.called,
      isStopCalled: this.stopBehavior.called,
      isCleanupCalled: this.cleanupBehavior.called,
      isCreateCalled: this.createBehavior.called,
      isValidateMessageCalled: this.validateMessageBehavior.called,
      isProcessCalled: this.processBehavior.called
    }
  }
}

module.exports.MockConsumer = MockConsumer
