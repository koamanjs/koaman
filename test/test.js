const supertest = require('supertest')
const app = require('./index')
const chai = require('chai')

const request = supertest(app.listen())

const { expect } = chai

describe('请求测试', () => {
  it('index', done => {
    request
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) throw err

        expect(res.text).to.equal('Hello Nana!')

        done()
      })
  })

  it('store code', done => {
    request
      .get('/code')
      .expect(200)
      .end((err, res) => {
        if (err) throw err

        expect(res.text).to.equal('2')

        done()
      })
  })
})
