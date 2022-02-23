(function ($, fns) {

  fns.worm = function(id, config) {

    var $div = $('<div></div>').appendTo($('#' + id))

    // Create hectad map from brcatlas library
    $('<div id="' + id + '-map">').appendTo($div)
    var brcmap = brcatlas.svgMap({
      selector: "#" + id + "-map",
      mapTypesKey: 'hectad',
      mapTypesSel: {
        'hectad': hectads,
      },
      transOptsKey: 'BI4',
      expand: true
    })
    brcmap.setIdentfier('Aporrectodea longa')
    brcmap.redrawMap()

    function hectads(identifier) {
      console.log('access called')
      return dots(identifier, 10000)
    }

    console.log('config', config)

    function dots(identifier, precision) {
      return new Promise(function (resolve, reject) {
        
        d3.csv(`${config.datapath}/taxa/${identifier}.csv`, function (r) {
          const grs = bigr.getLowerResGrs(r.gr.replace(/ /g,''))
          let gr
          if (precision === 5000) {
            if (grs.p5000 && grs.p5000.length === 1) {
              gr = grs.p5000[0]
            }
          } else {
            gr = grs[`p${precision}`]
          }
          if (gr) {
            return {
              gr: gr
            }
          }
        }).then(function (data) {
          let aggGrs = data.reduce((a,r) => {
            if (!a.includes(r.gr)) {
              a.push(r.gr)
            }
            return a
          }, [])
          aggGrs = aggGrs.map(gr => {
            var colour = '#F35A26'
            var opacity =  0.8
            return {
              gr: gr,
              colour: colour,
              opacity: opacity
            }
          })
          resolve({
            records: aggGrs,
            size: 1,
            precision: precision,
            shape: 'circle'
          })
        })["catch"](function (e) {
          console.log(e)
          reject(e)
        })
      })
    }
  
  }
})(jQuery, drupalSettings.brc_vis.fns)