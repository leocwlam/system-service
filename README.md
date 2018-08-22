# system-service
> Provide the basic service framework to help initial service implementation.  It can be easy to inject any message framework and has built-in logging mechanism.

[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/leocwlam/system-service/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/leocwlam/system-service.svg?branch=master)](https://travis-ci.org/leocwlam/system-service)
[![Coverage Status](https://coveralls.io/repos/github/leocwlam/system-service/badge.svg?branch=master)](https://coveralls.io/github/leocwlam/system-service?branch=master)
[![Dependency Status](https://david-dm.org/leocwlam/system-service.svg)](https://david-dm.org/leocwlam/system-service)
[![devDependency Status](https://david-dm.org/leocwlam/system-service/dev-status.svg)](https://david-dm.org/leocwlam/system-service?type=dev)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Greenkeeper badge](https://badges.greenkeeper.io/leocwlam/system-service.svg)](https://greenkeeper.io/)
[![npm badge](https://img.shields.io/npm/v/system-service/latest.svg)](https://www.npmjs.com/package/system-service)

# Contents
-------

<p align="center">
    <a href="#install">Install</a> &bull;
    <a href="#definition">Definition</a> &bull;
    <a href="#diagram">Diagram</a> &bull;
    <a href="#get-start">Get Start</a> &bull;
    <a href="#license">License</a>
</p>

-------

# <a name="install"></a>Install
**Install via npm:**
``` bash
npm install system-service --save
```


# <a name="definition"></a>Definition
``` js
const systemService = require('system-service')
const { SystemService, Logger, MessageConsumer } = systemService
```

## MessageConsumer
- MessageConsumer is base class, which uses for connecting with SystemService.  The derived class can be overwritten by the following methods:

| Method   | Description                                                                                                                  |
|----------|------------------------------------------------------------------------------------------------------------------------------|
| create   | Implement to connect the 3rd party consumer (e.g. RabbitMQ, kafka, etc) with callback to this.systemService.processMessage   |
| validate | Implement custom validation for any received message. If the message is invalid, then throw exception (or external handling) |
| process  | Implement how to prcoess the valid message                                                                                   |
| start    | Implement to start the 3rd party consumer                                                                                    |
| stop     | Implement how to stop the 3rd party consumer to pickup any message                                                           |
| cleanup  | Implement any cleanup after messageConsumer's stop method is triggered                                                       |

## SystemService
- SystemService is a message engine, which handles start and terminate the consumer

| Method | Description                      |
|--------|----------------------------------|
| start  | Service start to receive message |
| stop   | Service stop to receive message  |

# <a name="diagram"></a>Diagram

| Layout |
|--------|
|<div align="center"><img src="./docs/system-service.png" /></div>|

- Inside handling

| Workflow |
|----------|
|<div align="center"><img src="./docs/workflow.png" /></div>|

# <a name="get-start"></a>Get Start
Setup message cosumer
``` js
const mq = require('amqplib/callback_api')

const systemService = require('system-service')
const { MessageConsumer } = systemService

function errHandler(err) {
  // TODO: logging or exist ...
}

function MQConnect(conn, queueName, handler) {
  const on_open =  function (err, ch) {
    if (err !== null) {
      errHandler(err)
    } else {
      ch.assertQueue(queueName)
      ch.consume(queueName, function(msg) {
        if (msg !== null) {
          handler(msg);
          ch.ack(msg);
        }
      })
    }
  }

  return on_open
}

class DemoConsumer extends MessageConsumer {
  const URI = 'amqp://guest:guest@localhost:5672//'
  const QUEUENAME = 'Demo'
  constructor () {
    super()
    this.uri =  URI
    this.queueName = QUEUENAME
    this.conn = null
    this.on_open = null
  }

  create () {
    super.create()
    mq.connect(this.uri, function(err, conn) {
      if (err !== null) {
        errHandler(err);
      } else {
        this.conn = conn

        // config the mq consume to call this.systemService.processMessage
        this.on_open =  MQConnect(conn, this.queueName, this.systemService.processMessage);
      }
    })
  }

  validate (message) {
    super.validate(message)
    if ((message.cId === null) || (typeof message.cId === 'undefined')) {
      throw new Error('Missing Correlation Id')
    }
  }

  // process will only be called, when message is valid
  process (message) {
    super.process(message)
    // TODO: Implement handle message
    this.logger.log('info', 'Start process', message)
  }

  start () {
    super.start()
    const ok = this.conn.createChannel(this.on_open)

    if (ok === null) {
      errHandle(new Error('Fail: To create MQ channel'))
    }
  }
}

module.exports.DemoConsumer = DemoConsumer
```

``` js
const systemService = require('system-service')
const { SystemService, Logger } = systemService

const config = {log: {config :{level: Logger.Level.error}}}
const service = new SystemService(config, new DemoConsumer())

service.start()
```

# <a name="license"></a>License
MIT
