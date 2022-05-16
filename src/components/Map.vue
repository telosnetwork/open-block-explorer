<script lang="ts">
/* eslint-disable */
import { defineComponent, ref } from 'vue';
import 'vue3-openlayers/dist/vue3-openlayers.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import { easeOut } from 'ol/easing';
import { getVectorContext } from 'ol/render';
import { unByKey } from 'ol/Observable';
import { toStringHDMS } from 'ol/coordinate';

export default defineComponent({
  name: 'PageIndex',
  components: {
    Map,
    View
  },
  setup() {
    const center = ref([40, 40]);
    const projection = ref('EPSG:4326');
    const zoom = ref(8);
    const rotation = ref(0);
    return {
      center,
      projection,
      zoom,
      rotation
    };
  },
  data() {
    return {
      map: null
    };
  },
  mounted() {
    const style = new Style({
      fill: new Fill({
        color: '#4325c2'
      }),
      stroke: new Stroke({
        color: '#4325c2',
        width: 1
      }),
      image: new CircleStyle({
        fill: new Fill({
          color: '#8276d2'
        }),
        stroke: new Stroke({
          color: '#63C9EF',
          width: 3
        }),
        radius: 5
      })
    });

    // const tileLayer = new TileLayer({
    //   source: new OSM({
    //     wrapX: false
    //   })
    // });

    // const source = new VectorSource({
    //   wrapX: false,
    //   url: 'https://openlayers.org/data/vector/ecoregions.json',
    //   format: new GeoJSON()
    // });
    // const vector = new VectorLayer({
    //   source: source,

    // });

    const source = new VectorSource({
      wrapX: false,
      url: 'https://openlayers.org/data/vector/ecoregions.json',
      format: new GeoJSON()
    });
    const vector = new VectorLayer({
      background: '#071a5f',
      source: source,
      style: style
    });
    console.log(vector);

    const vectorLayer = new VectorLayer({
      background: '#2b209c',
      source: source,
      style: function (feature) {
        const color = '#4f2ccb';
        style.getFill().setColor(color);
        return style;
      }
    });

    // Overlay
    const container = this.$refs['popup'] as any;
    const content = this.$refs['popup-content'] as any;
    const closer = this.$refs['popup-closer'] as any;

    const overlay = new Overlay({
      element: container,
      autoPan: {
        animation: {
          duration: 250
        }
      }
    });

    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    //overlay

    const map = new Map({
      layers: [vector],
      overlays: [overlay],
      target: this.$refs['map-root'] as string,
      view: new View({
        center: [0, 0],
        zoom: 0
      })
    });

    var extent = source.getExtent();
    //map.getView().fit(extent, map.getSize() as any);

    map.on('singleclick', function (evt) {
      const coordinate = evt.coordinate;
      const hdms = toStringHDMS(toLonLat(coordinate));

      content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
      overlay.setPosition(coordinate);
    });

    function addRandomFeature() {
      const x = Math.random() * 360 - 180;
      const y = Math.random() * 170 - 85;
      const geom = new Point(fromLonLat([x, y]));
      const feature = new Feature(geom);
      source.addFeature(feature);
    }

    const duration = 3000;
    function flash(feature: any) {
      const start = Date.now();
      const flashGeom = feature.getGeometry().clone();
      const listenerKey = vector.on('postrender', animate);

      function animate(event: any) {
        const frameState = event.frameState;
        const elapsed = frameState.time - start;
        if (elapsed >= duration) {
          unByKey(listenerKey);
          return;
        }
        const vectorContext = getVectorContext(event);
        const elapsedRatio = elapsed / duration;
        // radius will be 5 at start and 30 at end.
        const radius = easeOut(elapsedRatio) * 25 + 5;
        const opacity = easeOut(1 - elapsedRatio);

        const style1 = new Style({
          image: new CircleStyle({
            radius: radius,
            stroke: new Stroke({
              color: 'rgba(255, 255, 255, ' + opacity + ')',
              width: 0.25 + opacity
            })
          })
        });

        vectorContext.setStyle(style1);
        vectorContext.drawGeometry(flashGeom);
        // tell OpenLayers to continue postrender animation
        map.render();
      }
    }

    source.on('addfeature', function (e) {
      flash(e.feature);
    });

    window.setInterval(addRandomFeature, 2000);
  }
});
</script>

<template lang="pug">

.map-container(id="map" ref="map-root")
div(id="popup" ref="popup" class="ol-popup")
  a(href="#" id="popup-closer" ref="popup-closer" class="ol-popup-closer")
  div(id="popup-content" ref="popup-content")
    

</template>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 90%
.map-container
  background-color: #213e5e
  background-repeat: no-repeat
  width: 100%
  height:80vh

.ol-popup
  position: absolute
  background-color: white
  box-shadow: 0 1px 4px rgba(0,0,0,0.2)
  padding: 15px
  border-radius: 10px
  border: 1px solid #cccccc
  bottom: 12px
  left: -50px
  min-width: 280px

.ol-popup:after, .ol-popup:before
  top: 100%
  border: solid transparent
  content: " "
  height: 0
  width: 0
  position: absolute
  pointer-events: none

.ol-popup:after
  border-top-color: white
  border-width: 10px
  left: 48px
  margin-left: -10px

.ol-popup:before
  border-top-color: #cccccc
  border-width: 11px
  left: 48px
  margin-left: -11px

.ol-popup-closer
  text-decoration: none
  position: absolute
  top: 2px
  right: 8px

.ol-popup-closer:after
  content: "✖"
</style>
