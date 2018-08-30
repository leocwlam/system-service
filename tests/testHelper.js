'use strict'

const uuidv4 = require('uuid/v4')

const generateCorrelationId = function () {
  return uuidv4()
}

const generateMessage = function (title, action, detail) {
  if ((detail === null) || (typeof detail === 'undefined')) {
    return { cid: generateCorrelationId(), content: { title: title, action: action, detail: detail } }
  }
  return { cid: generateCorrelationId(), content: { title: title, action: action } }
}

module.exports.correlationId = generateCorrelationId
module.exports.message = generateMessage
