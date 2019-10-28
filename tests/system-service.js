'use strict'
/* eslint-env mocha */

const chai = require('chai')
const { expect } = chai

const testHelper = require('./testHelper')
const consumer = require('./mockConsumer')

const systemService = require('../src/system-service')
const messageConsumer = require('../src/messageConsumer')
const { SystemService, Logger } = systemService
const { MessageConsumer } = messageConsumer

describe('system-service Tests', function () {
  describe('Setting Tests', function () {
    it('Pass no config ctor', function () {
      const service = new SystemService(null)
      expect(service.config).to.equal(null)
      expect(service.id).not.to.equal(null)
      expect(typeof service.id).not.to.equal('undefinded')
    })

    it('Pass with config', function () {
      const config = { log: {} }
      const service = new SystemService(config)
      expect(service.config).not.to.equal(null)
      expect(service.config.log).not.to.equal(null)
      expect(service.id).not.to.equal(null)
      expect(typeof service.id).not.to.equal('undefinded')
    })

    describe('Valid config log', function () {
      const testCases = [
        { description: 'Test only with config log without any setting parameters', config: { log: { config: {} } }, expectServiceLogLevel: 'error' },
        { description: 'Test only with file log without any setting parameters', config: { log: { file: {} } }, expectServiceLogLevel: 'info' },
        { description: 'Test only with source log  without any setting parameters', config: { log: { source: {} } }, expectServiceLogLevel: 'info' },
        { description: 'Test only with config log with log level parameter', config: { log: { config: { level: Logger.Level.debug } } }, expectServiceLogLevel: 'debug' }
      ]
      testCases.forEach(function (testCase) {
        it(`${testCase.description}`, function () {
          const service = new SystemService(testCase.config)
          expect(service.logger).not.to.equal(null)
          expect(service.logger.logger.level).to.equal(testCase.expectServiceLogLevel)
        })
      })
    })
  })

  describe('Service message validation Tests', function () {
    const service = new SystemService()
    it('No Message', function () {
      expect(() => service.validateMessage()).to.throw(Error)
    })
    it('Null Message', function () {
      expect(() => service.validateMessage(null)).to.throw(Error)
    })
  })

  describe('Procss message Tests', function () {
    describe('Fail Procss message Tests without messageConsumer', function () {
      const service = new SystemService({ log: { config: { silent: true } } })
      it('ProcessMessage undefinded message throw exception', function () {
        expect(() => service.processMessage()).to.throw(Error)
      })
      it('ProcessMessage null message throw exception', function () {
        expect(() => service.processMessage(null)).to.throw(Error)
      })

      it('ProcessMessage object message throw exception', function () {
        expect(() => service.processMessage(testHelper.message('test', 'add', { type: 'customer', name: 'tester' }))).to.throw(Error)
      })

      it('ProcessMessage string message throw exception', function () {
        expect(() => service.processMessage(JSON.stringify(testHelper.message('test', 'add', { type: 'customer', name: 'tester' })))).to.throw(Error)
        expect(() => service.processMessage(JSON.stringify(testHelper.message('test', 'add')))).to.throw(Error)
      })
    })

    describe('Procss message Tests with messageConsumer', function () {
      const service = new SystemService({ log: { config: { silent: true } } }, new MessageConsumer())
      it('ProcessMessage undefinded message without throw exception (Fail on validateMessage)', function () {
        service.processMessage()
      })
      it('ProcessMessage null message without throw exception (Fail on validateMessage)', function () {
        service.processMessage(null)
      })

      it('ProcessMessage object message without throw exception', function () {
        service.processMessage(testHelper.message('test', 'add', { type: 'customer', name: 'tester' }))
      })

      it('ProcessMessage string message without throw exception', function () {
        service.processMessage(JSON.stringify(testHelper.message('test', 'add', { type: 'customer', name: 'tester' })))
        service.processMessage(JSON.stringify(testHelper.message('test', 'add')))
      })
    })
  })

  describe('Service Start And End Tests', function () {
    it('Fail service start and stop without consumer', function () {
      const service = new SystemService({ log: { config: { level: Logger.Level.info, silent: true } } })
      expect(() => service.start()).to.throw(Error)
      expect(() => service.stop()).to.throw(Error)
    })

    it('Pass with config', function () {
      const service = new SystemService({ log: { config: { level: Logger.Level.info, silent: true } } }, new MessageConsumer())
      service.start()
      service.stop()
    })

    describe('Check service behavior', function () {
      it('start behavior will call create', function () {
        const mockConsumer = new consumer.MockConsumer()
        const service = new SystemService({ log: { config: { level: Logger.Level.info, silent: true } } }, mockConsumer)
        service.start()
        const report = mockConsumer.behaviorReport()
        expect(report.isStartCalled).to.equal(true)
        expect(report.isStopCalled).to.equal(false)
        expect(report.isCleanupCalled).to.equal(false)
        expect(report.isCreateCalled).to.equal(true)
        expect(report.isValidateMessageCalled).to.equal(false)
        expect(report.isProcessCalled).to.equal(false)
        service.stop()
      })

      it('stop behavior will call cleanup', function () {
        const mockConsumer = new consumer.MockConsumer()
        const service = new SystemService({ log: { config: { level: Logger.Level.info, silent: true } } }, mockConsumer)
        service.start()
        mockConsumer.reportReset()
        service.stop()
        const report = mockConsumer.behaviorReport()
        expect(report.isStartCalled).to.equal(false)
        expect(report.isStopCalled).to.equal(true)
        expect(report.isCleanupCalled).to.equal(true)
        expect(report.isCreateCalled).to.equal(false)
        expect(report.isValidateMessageCalled).to.equal(false)
        expect(report.isProcessCalled).to.equal(false)
      })

      it('receive message behavior', function () {
        const mockConsumer = new consumer.MockConsumer()
        const service = new SystemService({ log: { config: { level: Logger.Level.info, silent: true } } }, mockConsumer)
        service.start()
        mockConsumer.reportReset()
        mockConsumer.addInternalMessage('Simple Test')
        setTimeout(() => {
          const report = mockConsumer.behaviorReport()
          expect(report.isStartCalled).to.equal(false)
          expect(report.isStopCalled).to.equal(false)
          expect(report.isCleanupCalled).to.equal(false)
          expect(report.isCreateCalled).to.equal(false)
          expect(report.isValidateMessageCalled).to.equal(true)
          expect(report.isProcessCalled).to.equal(true)
          service.stop()
        }, 1000)
      })
    })
  })
})
