/*
 # Given a Two dimensional array, 
 # print out the letters, 
 # spiraling from the outside, in.
 # [
 # [ 'H', 'A', 'V' ],
 # [ 'D', 'A', 'E' ],
 # [ 'E', 'Y', 'A' ],
 # [ 'C', 'I', 'N' ]
 # ]
 # => "HAVEANICEDAY"
*/

const DELAY = 200

const SAMPLES = [
  [
    ['H', 'A', 'V'],
    ['D', 'A', 'E'],
    ['E', 'Y', 'A'],
    ['C', 'I', 'N']
  ]
]

function delay(interval) {
  return new Promise(function(resolve) {
    setTimeout(resolve, interval);
  });
}

//
// NOTE:  this is a simple Vue instance which will serve as an EventBus
//        for this application and allow data to flow between the Two
//        UI instances on the page...
//
//
const eventBus = new Vue()

const deepCopy = function(data) {
  return JSON.parse(JSON.stringify(data))
}

//
// NOTE:  this Vue instance solves the traversal of a matrix in a spiral
//        pattern and outputs it to the screen.  It also visually shows
//        what each matrix looks like before they are solved...
//
//
const app = new Vue({
  el: "#app",
  data: {
    samples: deepCopy(SAMPLES),
    results: [],
  },
  methods: {
    badgeFor: function(item) {
      return (item != '-') ? ['badge', 'badge-info'] : ['badge', 'badge-clear', 'white-space']
    },
    getMsTime: function() {
      return new Date().getTime()
    },
    reset: function(nuke) {
      if (nuke) {
        this.samples = []
      }
      this.results = []
    },
    newMatrix: function(matrix) {
      this.samples.push(matrix)
    },
    traverseRow: function(out, matrix, row, start, count, reverse) {
      const max = matrix.cols
      const tmp = matrix[row].slice(0, max)
      const list = (reverse ? tmp.reverse() : tmp).slice(start, count - 1)
      console.log(matrix, tmp, list)
      list.forEach(function(item) {
        setTimeout(function() { out.push(item) }, (DELAY * matrix.tick))
        matrix.tick += 1
      })
    },
    traverseCol: function(out, matrix, col, start, count, reverse) {
      const max = matrix.rows
      const tmp = matrix.map(function(row) { return row[col] }).slice(0, max)
      const list = (reverse ? tmp.reverse() : tmp).slice(start, count - 1)
      console.log(matrix, tmp, list)
      list.forEach(function(item) {
        setTimeout(function() { out.push(item) }, (DELAY * matrix.tick))
        matrix.tick += 1
      })
    },
    traverseSpiral: function(out, matrix) {
      let cols = matrix.cols
      let rows = matrix.rows
      let stop = cols * rows
      let next = 0
      while (matrix.tick < stop) {
        console.log('-- ts: ', matrix.tick, stop, rows, cols, next)
        this.traverseRow(out, matrix, next, next, cols, false)
        this.traverseCol(out, matrix, cols - 1, next, rows, false)
        this.traverseRow(out, matrix, rows - 1, next, cols, true)
        this.traverseCol(out, matrix, next, next, rows, true)
        rows -= 1
        cols -= 1
        next += 1
      }
    },
    process: function() {
      const vm = this
      this.reset(false)
      this.samples.forEach(function(matrix) {
        const rows = matrix.length
        const cols = matrix[0].length
        const list = []
        vm.results.push(list)
        console.log('-- gen', list)
        matrix.rows = rows
        matrix.cols = cols
        matrix.tick = 0
        vm.traverseSpiral(list, matrix)
      })
    }
  },
  created() {
    // NOTE:  lifecycle hook...
    eventBus.$on('new:matrix', this.newMatrix)
  }
})

//
// NOTE:  this Vue instance handles the form inputs and generates
//        a new matrix based on the string provided...
//
//
const form = new Vue({
  el: "#form",
  data: {
    matrix: [],
    source: ''
  },
  computed: {
    isDisabled: function() {
      return (this.source.length === 0)
    }
  },
  methods: {
    initMatrix: function(rows, cols, value) {
      const tmp = []
      for (let r = 0; r < rows; r++) {
        const list = []
        for (let c = 0; c < cols; c++) {
          list[c] = value
        }
        tmp.push(list)
      }
      tmp.rows = rows
      tmp.cols = cols
      tmp.tick = 0
      return tmp
    },
    splitData: function(matrix, input) {
      let cols = matrix.cols
      let rows = matrix.rows
      let stop = input.length
      let list = []
      let next = rows - 1
      let last = 0
      let tick = 0
      next = cols - 1
      console.log(rows, cols, next)
      while (tick < stop) {
        for (var i = 0; i < 4; i++) {
          const tmp = input.slice(last, next).split('')
          last = next
          next += i % 2 === 0 ? rows - 1 : cols - 1
          tick += tmp.length
          list.push(tmp)
          if (tick == stop) {
            break
          }
        }
        rows -= 2
        cols -= 2
        next -= 2
      }
      return list
    },
    populateMatrix: function(matrix, input) {
      matrix.stop = input.length
      const data = this.splitData(matrix, input)
      let rows = matrix.rows
      let cols = matrix.cols
      let step = 0
      let side = 0
      let tag = 0
      let offset = 0
      let depth = 0
      console.log(deepCopy(data))
      console.log('--')
      data.some(function(list) {
        const rowp = step % 2 === 0
        const revp = side > 1
        if (revp) {
          list.reverse()
          list.unshift(null)
        }
        for (let i = 0; i < offset; i++) {
          list.unshift(null)
        }
        if (rowp) {
          list.forEach(function(val, i) {
            if (val) {
              matrix[tag][i] = val
            }
          })
          console.log('-- even: ', list, revp, tag, offset)
        } else {
          if (depth != 0 && list.length < depth) {
            console.log('-- depth: ', depth, list.length)
            for (let i = 0; i < depth - list.length + 1; i++) {
              list.unshift(null)
            }
          }
          list.forEach(function(val, i) {
            if (val) {
              matrix[i][tag] = val
            }
          })
          depth = revp ? 0 : list.length + 1
          console.log('-- odd: ', list, revp, tag, offset, depth)
        }
        side += 1
        step += 1
        if (side > 3) {
          side = 0
          offset += 1
        }

        switch (side) {
          case 1:
            tag = cols - 1 - offset
            break
          case 2:
            tag = rows - 1 - offset
            break
          default:
            tag = offset
            break
        }
        return false
      })
    },
    generate: function() {
      console.log('-- generate')
      const input = this.source.trim().toUpperCase().replace(/\s/g, '')
      const len = input.length
      const cols = Math.floor(Math.sqrt(len))
      const rows = Math.ceil(len / cols)
      const count = cols * rows
      console.log('-- generate: ', len, cols, rows, count)
      const tmp = this.initMatrix(rows, cols, '-')
      this.populateMatrix(tmp, input)
      this.matrix = tmp
      eventBus.$emit('new:matrix', tmp)
    }
  }
})
