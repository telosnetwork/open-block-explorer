<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, computed } from 'vue';
import 'vue3-openlayers/dist/vue3-openlayers.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import { easeOut } from 'ol/easing';
import { getVectorContext } from 'ol/render';
import { unByKey } from 'ol/Observable';
import { mapActions } from 'vuex';
import { BP } from 'src/types';
import { useStore } from 'src/store';

// Map core style
const style = new Style({
  fill: new Fill({
    color: '#4325c2'
  }),
  stroke: new Stroke({
    color: '#4325c2',
    width: 1
  }),
  zIndex: 50
});

const featureStyle = new Style({
  image: new CircleStyle({
    fill: new Fill({
      color: '#8276d2'
    }),
    stroke: new Stroke({
      color: '#63C9EF',
      width: 3
    }),
    radius: 5
  }),
  zIndex: 51
});

// Map source uses vectorLayer with vector source
const source = new VectorSource({
  wrapX: false,
  url: 'https://openlayers.org/data/vector/ecoregions.json',
  format: new GeoJSON()
});

const vector = new VectorLayer({
  source: source,
  style: style
});

export default defineComponent({
  name: 'PageIndex',
  components: {
    Map,
    View
  },
  setup() {
    const store = useStore();
    const center = ref([40, 40]);
    const projection = ref('EPSG:4326');
    const zoom = ref(8);
    const rotation = ref(0);
    const BPlist = computed((): BP[] => store.state.chain.bpList);
    const HeadProducer = computed(
      (): string => store.state.chain.head_block_producer
    );
    return {
      center,
      projection,
      zoom,
      rotation,
      BPlist,
      HeadProducer
    };
  },
  data() {
    return {
      map: null,
      flashGeom: null,
      listenerKey: null,
      duration: 2600,
      MapSource: null
    };
  },
  methods: {
    ...mapActions('chain', ['updateBpList']),
  },
  async mounted() {
    await this.updateBpList();

    // BP location feature style with zIndex biggetr that map

    // ---- Overlay ----
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
    // ---- Overlay ----

    // ---- Map ----
    const map = new Map({
      layers: [vector],
      overlays: [overlay],
      target: this.$refs['map-root'] as string,
      view: new View({
        center: [0, 0],
        zoom: 0
      })
    });

    let selected = null as any;

    // Track mouse click and detect collisions with BP features for mobile
    map.on('singleclick', function (evt) {
      // Clear overlay when no collision
      if (
        selected !== null &&
        selected.getProperties().type &&
        selected.getProperties().type === 'bp'
      ) {
        overlay.setPosition(undefined);
        closer.blur();
        content.innerHTML = '&nbsp;';
        selected = null;
      }

      // Assign selected when collision occurs
      map.forEachFeatureAtPixel(evt.pixel, function (f) {
        if (f.getProperties().type && f.getProperties().type === 'bp') {
          selected = f;
        }
      });

      // Check if it is a BP collision, as countries are also features and have to be filtered.
      if (
        selected &&
        selected.getProperties().type &&
        selected.getProperties().type === 'bp'
      ) {
        content.innerHTML =
          '<div class="owner-text text-h5 text-center text-uppercase">' +
          selected.getId() +
          '</div>' +
          '<div class=".country-text text-subtitle1 text-center">' +
          selected.getProperties().country +
          '</div>';
        overlay.setPosition(selected.getGeometry().getCoordinates());
      } else {
        // Clear overlay if is not BP collision
        content.innerHTML = '&nbsp;';
      }
    });

    // Track mouse pointer and detect collisions with BP features
    map.on('pointermove', function (e) {
      // Clear overlay when no collision
      if (
        selected !== null &&
        selected.getProperties().type &&
        selected.getProperties().type === 'bp'
      ) {
        overlay.setPosition(undefined);
        closer.blur();
        content.innerHTML = '&nbsp;';
        selected = null;
      }

      // Assign selected when collision occurs
      map.forEachFeatureAtPixel(e.pixel, function (f) {
        if (f.getProperties().type && f.getProperties().type === 'bp') {
          selected = f;
        }
      });

      // Check if it is a BP collision, as countries are also features and have to be filtered.
      if (
        selected &&
        selected.getProperties().type &&
        selected.getProperties().type === 'bp'
      ) {
        content.innerHTML =
          '<div class="owner-text text-h5 text-center text-uppercase">' +
          selected.getId() +
          '</div>' +
          '<div class=".country-text text-subtitle1 text-center">' +
          selected.getProperties().country +
          '</div>';

        overlay.setPosition(selected.getGeometry().getCoordinates());
      } else {
        // Clear overlay if is not BP collision
        content.innerHTML = '&nbsp;';
      }
    });
    // ---- Map ----

    // Add all the BP location features from s3 bucket to map
    function addBP(BPlist: BP[]) {
      for (const bp of BPlist) {
        if (bp.org && bp.org.location) {
          const x = bp.org.location.longitude;
          const y = bp.org.location.latitude;
          const geom = new Point(fromLonLat([x, y]));
          const feature = new Feature(geom);
          feature.setStyle(featureStyle);
          feature.setId(bp.owner);
          feature.setProperties({ type: 'bp', country: bp.org.location.name });
          source.addFeature(feature);
        }
      }
    }

    const duration  = 2600;
    // Draw the flash animation on the BP feature location
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
    const list = this.BPlist;

    addBP(this.BPlist);
    this.map = map;
    this.MapSource = source;
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
  background-color: transparent
  background-repeat: no-repeat
  width: 100%
  height:80vh

.ol-popup
  position: absolute
  background: linear-gradient(90deg, #CBCAF5 0%, #A9CAF3 56.77%, #63C9EF 100%)
  box-shadow: 0 1px 4px rgba(0,0,0,0.2)
  padding: 15px
  border-radius: 10px
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
  border-top-color: #CBCAF5
  border-width: 10px
  left: 48px
  margin-left: -10px

.ol-popup:before
  border-top-color: #CBCAF5
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

.owner-text
  color: #071A5F
  font-family: Actor
  font-size: 13px
  font-weight: 400
  line-height: 16px
  letter-spacing: 0em
  text-align: center

.country-text
  color: #071A5F
  font-family: Roboto
  font-size: 10px
  font-weight: 400
  line-height: 12px
  letter-spacing: 0em
  text-align: left
</style>
