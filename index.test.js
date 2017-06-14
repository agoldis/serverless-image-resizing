const app = require('./');

describe('image resize', () => {
  test('throws', () => {
    const query = 'some';
    expect(() => {
      app.getDimensions(query)
    }).toThrow()
  })

  test('hadles width', () => {
    const query = 'http://something.com/w100/dir/file'
    expect(app.getDimensions(query)).toMatchObject({
      width: 100,
      height: null,
      originalKey: 'dir/file'
    })
  })

  test('hadles full dimention width', () => {
    const query = 'http://something.com/100x200/dir/file'
    expect(app.getDimensions(query)).toMatchObject({
      width: 100,
      height: 200,
      originalKey: 'dir/file'
    })
  })
})